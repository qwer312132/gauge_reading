from django.contrib import admin
from django.db import models

class MyData(models.Model):
    data = models.CharField(max_length=100)
    image = models.ImageField(null=True, upload_to='images/')
    gauge_data = models.FloatField(null=True)
    
    def __str__(self):
        return self.data

class MyDataAdmin(admin.ModelAdmin):
	list_display = [field.name for field in MyData._meta.fields]
     
class Maskrcnndata(models.Model):
    startx = models.FloatField(null=True)
    starty = models.FloatField(null=True)
    startvalue = models.IntegerField(null=True)
    endx = models.FloatField(null=True)
    endy = models.FloatField(null=True)
    endvalue = models.IntegerField(null=True)
    image = models.ImageField(null=True, upload_to='maskrcnnFile/trainImage/')
    needlemask = models.ImageField(null=True, upload_to='maskrcnnFile/trainMask/')
    needleKD = models.FileField(null=True, upload_to='maskrcnnFile/trainMask/')
    discmask = models.ImageField(null=True, upload_to='maskrcnnFile/trainMask/')
    discKD = models.FileField(null=True, upload_to='maskrcnnFile/trainMask/')

class MaskrcnndataAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Maskrcnndata._meta.fields]