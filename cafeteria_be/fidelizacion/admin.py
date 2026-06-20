from django.contrib import admin

from .models import (
    BolsaPuntos,
    ClienteFidelizacion,
    ConceptoUsoPuntos,
    ProcesoFidelizacion,
    ReglaAsignacionPuntos,
    UsoPuntos,
    VencimientoPuntos,
)


admin.site.register(ClienteFidelizacion)
admin.site.register(ConceptoUsoPuntos)
admin.site.register(ReglaAsignacionPuntos)
admin.site.register(VencimientoPuntos)
admin.site.register(BolsaPuntos)
admin.site.register(UsoPuntos)
admin.site.register(ProcesoFidelizacion)
