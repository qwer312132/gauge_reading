from django.contrib import admin
from django.db import models

class MyData(models.Model):
    data = models.CharField(max_length=100)
    image = models.ImageField(null=True, upload_to='images/')
    def __str__(self):
        return self.data

class MyDataAdmin(admin.ModelAdmin):
	list_display = [field.name for field in MyData._meta.fields]
