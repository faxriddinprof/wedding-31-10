from datetime import datetime
from zoneinfo import ZoneInfo
from django.test import TestCase
from django.urls import reverse
from .models import GuestResponse
from .views import EVENT_DATE


class InvitationTests(TestCase):
    def test_share_preview_is_absolute_and_server_rendered(self):
        response = self.client.get(reverse("home"), secure=True)
        self.assertContains(response, 'property="og:image" content="https://testserver/static/invitation/images/invitation-preview-v2.jpg"')
        self.assertContains(response, 'property="og:url" content="https://testserver/"')
        self.assertContains(response, 'property="og:image:width" content="1200"')
        self.assertContains(response, 'property="og:image:height" content="630"')
        self.assertContains(response, 'name="twitter:card" content="summary_large_image"')

    def test_music_uses_local_una_mattina_file(self):
        response = self.client.get(reverse("home"))
        self.assertContains(response, '/static/invitation/audio/una-mattina.mp3')
        self.assertContains(response, 'id="background-audio" loop')
        self.assertNotContains(response, 'sokin-ohang.mp3')
        self.assertNotContains(response, 'youtube')

    def test_invitation_contains_correct_event_and_venue(self):
        response = self.client.get(reverse("home"))
        self.assertContains(response, "Asliddin")
        self.assertContains(response, "Go‘zal")
        self.assertContains(response, '2026-10-31T18:00:00+05:00')
        self.assertContains(response, "ODILBEK 555")
        self.assertContains(response, "https://maps.app.goo.gl/s7fCjrmRfJhqSfjN9?g_st=atm")
        self.assertEqual(EVENT_DATE.astimezone(ZoneInfo("UTC")).hour, 13)

    def test_response_is_persisted_and_private(self):
        guest = GuestResponse.objects.create(name="Avvalgi mehmon", attendance="yes", guests=2, message="Baxtli bo‘ling!")
        self.assertNotContains(self.client.get(reverse("home")), guest.message)
        self.assertRedirects(self.client.get("/admin/invitation/guestresponse/"), "/admin/login/?next=/admin/invitation/guestresponse/", fetch_redirect_response=False)

    def test_calendar_has_correct_utc_and_utf8_folding(self):
        response = self.client.get(reverse("calendar"))
        self.assertEqual(response.status_code, 200)
        payload = response.content.decode("utf-8")
        self.assertIn("DTSTART:20261031T130000Z\r\n", payload)
        self.assertIn("BEGIN:VCALENDAR\r\n", payload)
        self.assertIn('attachment;', response["Content-Disposition"])
        for line in payload.split("\r\n"):
            self.assertLessEqual(len(line.encode("utf-8")), 75)
        self.assertEqual(datetime(2026, 10, 31).weekday(), 5)

    def test_rsvp_rejects_get(self):
        self.assertEqual(self.client.get("/rsvp/").status_code, 404)
