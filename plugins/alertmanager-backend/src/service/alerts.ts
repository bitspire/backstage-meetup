export const alertmanagers = [
  {
    name: 'applications',
    alerts: [
      {
        annotations: {
          description:
            'This is an alert meant to ensure that the entire alerting pipeline is functional.\nThis alert is always firing, therefore it should always be firing in Alertmanager\nand always fire against a receiver. There are integrations with various notification\nmechanisms that send a notification when this alert is not firing. For example the\n"DeadMansSnitch" integration in PagerDuty.\n',
          runbook_url:
            'https://runbooks.prometheus-operator.dev/runbooks/general/watchdog',
          summary:
            'An alert that should always be firing to certify that Alertmanager is working properly.',
        },
        endsAt: '2022-06-21T11:40:47.820Z',
        fingerprint: 'd200352fd868ba95',
        receivers: [{ name: 'UptimeHeartbeat' }],
        startsAt: '2022-06-12T07:29:17.820Z',
        status: { inhibitedBy: [], silencedBy: [], state: 'active' },
        updatedAt: '2022-06-21T11:36:47.826Z',
        generatorURL:
          'https://prom-ext.beyond.cc/graph?g0.expr=vector%281%29\u0026g0.tab=1',
        labels: {
          alertname: 'Watchdog',
          prometheus: 'monitoring/monitoring-kube-prometheus-prometheus',
          severity: 'none',
        },
      },
    ],
  },
  {
    name: 'development',
    alerts: [
      {
        annotations: {
          description:
            'This is an alert meant to ensure that the entire alerting pipeline is functional.\nThis alert is always firing, therefore it should always be firing in Alertmanager\nand always fire against a receiver. There are integrations with various notification\nmechanisms that send a notification when this alert is not firing. For example the\n"DeadMansSnitch" integration in PagerDuty.\n',
          runbook_url:
            'https://runbooks.prometheus-operator.dev/runbooks/general/watchdog',
          summary:
            'An alert that should always be firing to certify that Alertmanager is working properly.',
        },
        endsAt: '2022-06-21T11:40:23.353Z',
        fingerprint: 'd200352fd868ba95',
        receivers: [{ name: 'UptimeHeartbeat' }],
        startsAt: '2022-06-13T00:40:53.353Z',
        status: { inhibitedBy: [], silencedBy: [], state: 'active' },
        updatedAt: '2022-06-21T11:36:23.356Z',
        generatorURL:
          'https://prom-dev.beyond.cc/graph?g0.expr=vector%281%29\u0026g0.tab=1',
        labels: {
          alertname: 'Watchdog',
          prometheus: 'monitoring/monitoring-kube-prometheus-prometheus',
          severity: 'none',
        },
      },
    ],
  },
  {
    name: 'external',
    alerts: [
      {
        annotations: {
          description:
            'This is an alert meant to ensure that the entire alerting pipeline is functional.\nThis alert is always firing, therefore it should always be firing in Alertmanager\nand always fire against a receiver. There are integrations with various notification\nmechanisms that send a notification when this alert is not firing. For example the\n"DeadMansSnitch" integration in PagerDuty.\n',
          runbook_url:
            'https://runbooks.prometheus-operator.dev/runbooks/general/watchdog',
          summary:
            'An alert that should always be firing to certify that Alertmanager is working properly.',
        },
        endsAt: '2022-06-21T11:39:36.741Z',
        fingerprint: 'd200352fd868ba95',
        receivers: [{ name: 'UptimeHeartbeat' }],
        startsAt: '2022-06-12T07:28:06.741Z',
        status: { inhibitedBy: [], silencedBy: [], state: 'active' },
        updatedAt: '2022-06-21T11:35:36.746Z',
        generatorURL:
          'https://prom-apps.beyond.cc/graph?g0.expr=vector%281%29\u0026g0.tab=1',
        labels: {
          alertname: 'Watchdog',
          prometheus: 'monitoring/monitoring-kube-prometheus-prometheus',
          severity: 'none',
        },
      },
    ],
  },
];
