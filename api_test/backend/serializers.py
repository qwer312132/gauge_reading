from rest_framework import serializers

class MyDataSerializer(serializers.Serializer):
    data = serializers.CharField(max_length=100)
