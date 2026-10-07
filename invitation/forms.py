from django import forms
from .models import GuestResponse


class RSVPForm(forms.ModelForm):
    website = forms.CharField(required=False, widget=forms.HiddenInput)
    guests = forms.IntegerField(min_value=1, max_value=10, required=False)

    class Meta:
        model = GuestResponse
        fields = ["name", "attendance", "guests", "message"]

    def clean_name(self):
        name = " ".join(self.cleaned_data["name"].split())
        if len(name) < 2:
            raise forms.ValidationError("Iltimos, ismingizni to‘liq kiriting.")
        return name

    def clean(self):
        data = super().clean()
        if data.get("website"):
            raise forms.ValidationError("Javobni yuborib bo‘lmadi. Qayta urinib ko‘ring.")
        if data.get("attendance") == "no":
            data["guests"] = 0
        elif data.get("attendance") == "yes" and data.get("guests") is None:
            self.add_error("guests", "Necha kishi kelishini belgilang.")
        return data
