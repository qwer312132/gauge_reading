# Generated by Django 3.2.20 on 2023-07-16 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MyData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.CharField(max_length=100)),
            ],
        ),
        migrations.DeleteModel(
            name='MyModel',
        ),
    ]