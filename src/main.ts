import * as core from '@actions/core'
import * as github from '@actions/github'
import {getRelease, getStoryIdsFromRelease} from './github'
import {getStateId, updateReleaseTicket, updateStory} from './shortcut'

export async function run(): Promise<void> {
  try {
    const releaseName: string = core.getInput('release_name', {required: true})
    const workflowName: string = core.getInput('workflow', {required: true})
    const workflowStateName: string = core.getInput('workflow_state', {
      required: true
    })

    const releaseTicketId: string = core.getInput('release_ticket_id', {
      required: true
    })
    if (process.env.GITHUB_TOKEN === undefined) {
      throw new Error('GITHUB_TOKEN env variable is not set')
    }
    if (process.env.SHORTCUT_TOKEN === undefined) {
      throw new Error('SHORTCUT_TOKEN env variable is not set')
    }

    const {owner, repo} = github.context.repo
    // const owner = 'gradual-inc'
    // const repo = 'gradual'

    const release = await getRelease({
      owner,
      repo,
      releaseName,
      token: process.env.GITHUB_TOKEN
    })
    core.info(`get release ${release.name}`)

    const tickets = getStoryIdsFromRelease({
      content: release.body,
      rex: /\[SC-(\d+)\]/g
    })

    core.info(`tickets to process: ${Array.from(tickets).join(',')}`)

    const stateId = await getStateId({
      workflowName,
      workflowStateName,
      token: process.env.SHORTCUT_TOKEN
    })

    for (const ticket of tickets) {
      await updateStory({
        stateId,
        releaseTicketId,
        storyId: ticket,
        token: process.env.SHORTCUT_TOKEN
      })
      core.info(`update story: ${ticket}`)
    }

    await updateReleaseTicket({
      projectName: repo,
      releaseName: release.name,
      releaseContent: release.body || '',
      releaseUrl: release.html_url,
      token: process.env.SHORTCUT_TOKEN,
      releaseTicketId
    })
    core.info(`update release ticket: ${releaseTicketId}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
