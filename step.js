#!/usr/bin/env node

const axios = require('axios');
const moment = require('moment');

const debug = process.argv[2]; // debug yes/no
const webhook_url = process.argv[3]; // webhook_url
const preset_status = process.argv[4]; // preset_status
const mention_role = process.argv[5]; // mention_role

const app_title = process.env.BITRISE_APP_TITLE;
const workflow_title = process.env.BITRISE_TRIGGERED_WORKFLOW_TITLE;
const build_number = process.env.BITRISE_BUILD_NUMBER;
const build_url = process.env.BITRISE_BUILD_URL || 'https://bitrise.io';
const build_date = new Date().toISOString();
const git_branch = process.env.BITRISE_GIT_BRANCH;

// testing parameters
if (debug == null || webhook_url == null || preset_status == null) {
  console.log('ERROR : One or more parameters are invalid');
  return 1;
}

if (debug === 'yes') {
  console.log('******* DISCORD MESSAGE - INPUT PARAMETERS *******');
  console.log('Debug: ' + debug);
  console.log('Webhook URL: ' + webhook_url);
  console.log('Preset Status: ' + preset_status);
  console.log('App Title: ' + app_title);
  console.log('Workflow Title: ' + workflow_title);
  console.log('Build Number: ' + build_number);
  console.log('Build URL: ' + build_url);
}

function capitalize(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

function getState() {
  if (preset_status !== 'auto') {
    return preset_status;
  }
  if (process.env.BITRISE_BUILD_STATUS === '0') {
    return 'success';
  }
  return 'failed';
}

function getStateTitle() {
  if (preset_status !== 'auto') {
    return capitalize(preset_status);
  }
  if (process.env.BITRISE_BUILD_STATUS === '0') {
    return 'Success';
  }
  return 'Failed';
}

function getStateColor() {
  switch (preset_status) {
    case 'running':
      return '41727';
    case 'aborted':
      return '16762112';
    case 'failed':
      return '16720216';
    default:
      if (process.env.BITRISE_BUILD_STATUS === '0') {
        return '1033097';
      }
      return '16720216';
  }
}

axios
  .post(webhook_url, {
    content: getState() === 'failed' ? mention_role : '',
    embeds: [
      {
        color: getStateColor(),
        title: `${getStateTitle()} @ ${git_branch} → ${workflow_title}`,
        url: build_url,
        thumbnail: {
          url: 'https://i.imgur.com/DZZ1AyE.jpg'
        },
        fields: [
          {
            name: 'App',
            value: app_title,
            inline: true
          },
          {
            name: 'Workflow',
            value: workflow_title,
            inline: true
          },
          {
            name: 'Branch',
            value: git_branch,
            inline: true
          }
        ],
        footer: {
          text: `Triggered on ${moment(build_date).format(
            'YYYY.MM.DD HH:mm'
          )} - #${build_number}`
        }
      }
    ]
  })
  .then(res => {
    if (debug == 'yes') {
      console.log('******* DISCORD MESSAGE - WEBHOOK SUCCESS RESPONSE *******');
      console.log('STATUS:', res.statusCode);
      console.log('RESPONSE:', res.data);
    }
    return 0;
  })
  .catch(error => {
    console.error(
      'ERROR: Failed to send the Discord message',
      error.response.data
    );
    return 1;
  });
