from rest_framework import serializers
from .models import MyData
class MyDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyData
        fields = '__all__'
class GaugedataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyData
        fields = '__all__'