const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github, comment }) {
  const { payload, ref, workflow, eventName } = github.context;
  const { owner, repo } = context.repo;
  const event = eventName;
  const branch = event === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');

  const sha = event === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;
  const runId = parseInt(process.env.GITHUB_RUN_ID, 10);

  const referenceLink =
    event === 'pull_request'
      ? {
          title: 'Pull Request',
          value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
          short: true,
        }
      : {
          title: 'Branch',
          value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
          short: true,
        };

  const fields = [
    {
      title: 'Repo',
      value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      short: true,
    },
    {
      title: 'Workflow',
      value: `<https://github.com/${owner}/${repo}/actions/runs/${runId} | ${workflow}>`,
      short: true,
    },
    {
      title: 'Status',
      value: status,
      short: true,
    },
    referenceLink,
    {
      title: 'Event',
      value: event,
      short: true,
    },
  ];

  // if comment is not null, add it to the fields
  if (comment) {
    fields.push({
      title: 'Comment',
      value: comment,
      short: false,
    });
  }

  return [
    {
      color,
      fields: fields,
      text: payload.head_commit.message,
      footer_icon: 'https://github.githubassets.com/favicon.ico',
      footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      ts: Math.floor(Date.now() / 1000),
    },
  ];
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

module.exports.formatChannelName = formatChannelName;
