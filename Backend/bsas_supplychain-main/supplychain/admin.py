from django.contrib import admin

from . import models

admin.site.register(models.StakeholderProfile)
admin.site.register(models.KYCRecord)
admin.site.register(models.CropBatch)
admin.site.register(models.TransportRequest)
admin.site.register(models.InspectionReport)
admin.site.register(models.BatchSplit)
admin.site.register(models.RetailListing)
admin.site.register(models.ConsumerScan)
