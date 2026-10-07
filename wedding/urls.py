from django.contrib import admin
from django.urls import path
from invitation import views

urlpatterns = [
    path("", views.home, name="home"),
    path("wedding.ics", views.calendar_event, name="calendar"),
    path("admin/", admin.site.urls),
]
