from datetime import datetime
from zoneinfo import ZoneInfo
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.cache import never_cache
from .forms import RSVPForm
from .models import GuestResponse

EVENT_DATE = datetime(2026, 10, 31, 18, 0, tzinfo=ZoneInfo("Asia/Tashkent"))
MAP_URL = "https://maps.app.goo.gl/s7fCjrmRfJhqSfjN9?g_st=atm"


def page_context(request, form=None):
    response = GuestResponse.objects.filter(pk=request.session.get("response_id")).first()
    return {
        "event_iso": EVENT_DATE.isoformat(),
        "map_url": MAP_URL,
        "form": form if form is not None else RSVPForm(instance=response),
        "responded": response is not None,
        "calendar_days": range(1, 32),
        "calendar_blanks": range(3),
    }


@require_GET
@never_cache
def home(request):
    return render(request, "invitation/home.html", page_context(request))


@require_POST
def rsvp(request):
    wants_json = request.headers.get("Accept") == "application/json"
    now = timezone.now().timestamp()
    last = request.session.get("last_rsvp", 0)
    if now - last < 8:
        text = "Javobingiz saqlangan. Yana yuborishdan oldin bir oz kuting."
        if wants_json:
            return JsonResponse({"ok": False, "message": text}, status=429)
        form = RSVPForm(request.POST)
        form.is_valid()
        form.add_error(None, text)
        return render(request, "invitation/home.html", page_context(request, form), status=429)
    instance = GuestResponse.objects.filter(pk=request.session.get("response_id")).first()
    form = RSVPForm(request.POST, instance=instance)
    if form.is_valid():
        response = form.save()
        request.session["response_id"] = response.pk
        request.session["last_rsvp"] = now
        if wants_json:
            return JsonResponse({"ok": True, "message": "Rahmat! Javobingiz va ezgu tilaklaringiz bizga yetib keldi."})
        return redirect(reverse("home") + "?sent=1#ishtirok")
    if wants_json:
        return JsonResponse({"ok": False, "errors": form.errors.get_json_data()}, status=400)
    return render(request, "invitation/home.html", page_context(request, form), status=400)


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
