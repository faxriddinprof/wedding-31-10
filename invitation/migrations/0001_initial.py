from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [migrations.CreateModel(
        name="GuestResponse",
        fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("name", models.CharField(max_length=100, verbose_name="Ism-familiya")),
            ("attendance", models.CharField(choices=[("yes", "Albatta, kelaman"), ("no", "Afsuski, kela olmayman")], max_length=3, verbose_name="Ishtirok")),
            ("guests", models.PositiveSmallIntegerField(default=1, verbose_name="Mehmonlar soni")),
            ("message", models.TextField(blank=True, max_length=1000, verbose_name="Tilak")),
            ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Yuborilgan vaqt")),
            ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Yangilangan vaqt")),
        ],
        options={"ordering": ["-created_at"], "verbose_name": "Mehmon javobi", "verbose_name_plural": "Mehmonlar javoblari"},
    )]
