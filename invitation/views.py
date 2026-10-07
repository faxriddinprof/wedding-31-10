from datetime import datetime
from zoneinfo import ZoneInfo
from django.http import HttpResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_GET
from django.views.decorators.cache import never_cache

EVENT_DATE = datetime(2026, 10, 31, 18, 0, tzinfo=ZoneInfo("Asia/Tashkent"))
MAP_URL = "https://maps.app.goo.gl/s7fCjrmRfJhqSfjN9?g_st=atm"


def page_context():
    return {
        "event_iso": EVENT_DATE.isoformat(),
        "map_url": MAP_URL,
        "calendar_days": range(1, 32),
        "calendar_blanks": range(3),
    }


@require_GET
@never_cache
def home(request):
    context = page_context()
    context.update({
        "share_url": request.build_absolute_uri(reverse("home")),
        "share_image_url": request.build_absolute_uri(static("invitation/images/invitation-preview.jpg")),
    })
    return render(request, "invitation/home.html", context)


@require_GET
def calendar_event(request):
    # RFC 5545: fold UTF-8 lines at 75 octets, never splitting a code point.
    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Asliddin Guzal//Wedding//UZ",
        "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
        "UID:asliddin-guzal-20261031@wedding.local",
        "DTSTAMP:" + timezone.now().strftime("%Y%m%dT%H%M%SZ"),
        "DTSTART:20261031T130000Z",
        "SUMMARY:Asliddin va Guzal — nikoh to‘yi",
        "LOCATION:ODILBEK 555 to‘yxonasi\\, Mirbozor\\, Samarqand viloyati",
        "DESCRIPTION:Sizni nikoh to‘yimizga lutfan taklif etamiz.\\nManzil: " + MAP_URL,
        "URL:" + MAP_URL,
        "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY",
        "DESCRIPTION:Ertaga Asliddin va Guzalning nikoh to‘yi", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR",
    ]
    folded = []
    for line in lines:
        part = ""
        for char in line:
            if len((part + char).encode("utf-8")) > 75:
                folded.append(part)
                part = " "
            part += char
        folded.append(part)
    result = HttpResponse("\r\n".join(folded) + "\r\n", content_type="text/calendar; charset=utf-8")
    result["Content-Disposition"] = 'attachment; filename="Asliddin-Guzal.ics"'
    return result
