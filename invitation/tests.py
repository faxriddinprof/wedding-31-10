from datetime import datetime
from zoneinfo import ZoneInfo
from django.test import Client, TestCase
from django.urls import reverse
from .models import GuestResponse
from .views import EVENT_DATE


class InvitationTests(TestCase):
    def data(self, **changes):
        return {"name": "Aziz Mehmon", "attendance": "yes", "guests": "2", "message": "Baxtli bo‘ling!", **changes}

    def post(self, **changes):
        return self.client.post(reverse("rsvp"), self.data(**changes), HTTP_ACCEPT="application/json")

    def test_invitation_contains_correct_event_and_venue(self):
        response = self.client.get(reverse("home"))
        self.assertContains(response, "Asliddin")
        self.assertContains(response, "Guzal")
        self.assertContains(response, '2026-10-31T18:00:00+05:00')
        self.assertContains(response, "ODILBEK 555")
        self.assertContains(response, "https://maps.app.goo.gl/s7fCjrmRfJhqSfjN9?g_st=atm")
        self.assertEqual(EVENT_DATE.astimezone(ZoneInfo("UTC")).hour, 13)

    def test_response_is_persisted_and_private(self):
        response = self.post()
        self.assertEqual(response.status_code, 200)
        guest = GuestResponse.objects.get()
        self.assertEqual(guest.guests, 2)
        self.assertEqual(guest.message, "Baxtli bo‘ling!")
        self.assertNotContains(Client().get(reverse("home")), guest.message)
        self.assertRedirects(self.client.get("/admin/invitation/guestresponse/"), "/admin/login/?next=/admin/invitation/guestresponse/", fetch_redirect_response=False)

    def test_decline_saves_zero_guests(self):
        self.assertEqual(self.post(attendance="no", guests="").status_code, 200)
        self.assertEqual(GuestResponse.objects.get().guests, 0)

    def test_validation_rejects_bad_counts_and_names(self):
        for data in ({"guests": "11"}, {"guests": "0"}, {"guests": "-1"}, {"guests": ""}, {"name": "  "}, {"name": "A"}, {"attendance": "maybe"}, {"message": "x" * 1001}):
            with self.subTest(data=data):
                self.assertEqual(self.post(**data).status_code, 400)
        self.assertEqual(GuestResponse.objects.count(), 0)

    def test_honeypot_rejected(self):
        self.assertEqual(self.post(website="spam.example").status_code, 400)
        self.assertEqual(GuestResponse.objects.count(), 0)

    def test_double_submit_throttled_and_later_update_reuses_response(self):
        self.post()
        self.assertEqual(self.post(guests="4").status_code, 429)
        session = self.client.session
        session["last_rsvp"] = 0
        session.save()
        self.assertEqual(self.post(guests="4").status_code, 200)
        self.assertEqual(GuestResponse.objects.count(), 1)
        self.assertEqual(GuestResponse.objects.get().guests, 4)

    def test_csrf_required_and_supported(self):
        browser = Client(enforce_csrf_checks=True)
        self.assertEqual(browser.post(reverse("rsvp"), self.data()).status_code, 403)
        browser.get(reverse("home"))
        data = self.data(csrfmiddlewaretoken=browser.cookies["csrftoken"].value)
        self.assertEqual(browser.post(reverse("rsvp"), data).status_code, 302)

    def test_no_javascript_success_and_errors(self):
        response = self.client.post(reverse("rsvp"), self.data(name=""))
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'id="rsvp-form"', status_code=400)
        response = self.client.post(reverse("rsvp"), self.data())
        self.assertRedirects(response, "/?sent=1#ishtirok", fetch_redirect_response=False)

    def test_user_text_is_escaped_on_redisplay(self):
        self.post(name='<script>alert("x")</script>')
        response = self.client.get(reverse("home"))
        self.assertNotContains(response, '<script>alert("x")</script>')
        self.assertContains(response, "&lt;script&gt;")

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
        self.assertEqual(self.client.get(reverse("rsvp")).status_code, 405)
