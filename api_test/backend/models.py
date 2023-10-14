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
     
class Gaugedata(models.Model):
    startx = models.FloatField(null=True)
    starty = models.FloatField(null=True)
    endx = models.FloatField(null=True)
    endy = models.FloatField(null=True)
    image = models.ImageField(null=True, upload_to='maskrcnnimage/')
    def __str__(self):
        return self.gauge_data

class GaugedataAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Gaugedata._meta.fields]