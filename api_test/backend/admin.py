from django.contrib import admin
from .models import MyData, MyDataAdmin
# Register your models here.
admin.site.register(MyData,MyDataAdmin)