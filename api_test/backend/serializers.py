from rest_framework import serializers
from .models import MyData
from .models import Maskrcnndata
class MyDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyData
        fields = '__all__'
class MaskrcnndataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maskrcnndata
        fields = '__all__'