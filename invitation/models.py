from django.db import models


class GuestResponse(models.Model):
    class Attendance(models.TextChoices):
        YES = "yes", "Albatta, kelaman"
        NO = "no", "Afsuski, kela olmayman"

    name = models.CharField("Ism-familiya", max_length=100)
    attendance = models.CharField("Ishtirok", max_length=3, choices=Attendance.choices)
    guests = models.PositiveSmallIntegerField("Mehmonlar soni", default=1)
    message = models.TextField("Tilak", max_length=1000, blank=True)
    created_at = models.DateTimeField("Yuborilgan vaqt", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan vaqt", auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Mehmon javobi"
        verbose_name_plural = "Mehmonlar javoblari"

    def __str__(self):
        return self.name
