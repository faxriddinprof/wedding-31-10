from django.contrib import admin
from .models import GuestResponse


@admin.register(GuestResponse)
class GuestResponseAdmin(admin.ModelAdmin):
    list_display = ("name", "attendance", "guests", "created_at")
    list_filter = ("attendance",)
    search_fields = ("name", "message")
    readonly_fields = ("created_at", "updated_at")


admin.site.site_header = "Asliddin & Guzal · Mehmonlar"
admin.site.site_title = "Taklifnoma boshqaruvi"
admin.site.index_title = "To‘yga tayyorgarlik"
