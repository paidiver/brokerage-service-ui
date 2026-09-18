{{- define "brokerage-service-ui.name" -}}
brokerage-service-ui
{{- end }}

{{- define "brokerage-service-ui.fullname" -}}
{{- if contains (include "brokerage-service-ui.name" .) .Release.Name -}}
{{ .Release.Name }}
{{- else -}}
{{ printf "%s-%s" .Release.Name (include "brokerage-service-ui.name" .) }}
{{- end -}}
{{- end }}

