from django.contrib import admin
from .models import MyData, MyDataAdmin
from .models import Maskrcnndata, MaskrcnndataAdmin
# Register your models here.
admin.site.register(MyData,MyDataAdmin)
admin.site.register(Maskrcnndata,MaskrcnndataAdmin)