import * as R from 'ramda'
import * as core from '@actions/core'
import {ShortcutClient} from '@useshortcut/client'

export async function getStateId({
  workflowName,
  workflowStateName,
  token
}: {
  workflowName: string
  workflowStateName: string
  token: string
}): Promise<number> {
  const shortcut = new ShortcutClient(token)
  const workflows = (await shortcut.listWorkflows()).data
  const workflow = R.find(w => w.name === workflowName, workflows)
  if (!workflow?.states) {
    throw new Error(`Can not find workflow ${workflowName}`)
  }
  const state = R.find(s => s.name === workflowStateName, workflow?.states)
  if (!state) {
    throw new Error(`Can not find workflow ${workflowStateName}`)
  }
  return state.id
}

export async function updateStory({
  stateId,
  storyId,
  releaseTicketId,
  token
}: {
  stateId: number
  storyId: string
  releaseTicketId: string
  token: string
}): Promise<void> {
  const shortcut = new ShortcutClient(token)
  try {
    await shortcut.updateStory(Number(storyId), {
      workflow_state_id: stateId
    })
    core.info(`updated ticket ${storyId}`)
  } catch (e) {
    core.warning(`fail to update ticket ${storyId} with error: ${e}`)
  }

  try {
    await shortcut.createStoryLink({
      object_id: Number(releaseTicketId),
      subject_id: Number(storyId),
      verb: 'relates to'
    })
    core.info(`linked story ${storyId} to release story ${releaseTicketId}`)
  } catch (e) {
    core.warning(`fail to link ticket ${storyId} with error: ${e}`)
  }
}

export async function updateReleaseTicket({
  projectName,
  releaseContent,
  releaseName,
  releaseUrl,
  releaseTicketId,
  token
}: {
  projectName: string
  releaseContent: string
  releaseName: string
  releaseUrl: string
  releaseTicketId: string
  token: string
}): Promise<void> {
  const shortcut = new ShortcutClient(token)

  const releaseTicketContent = (
    await shortcut.getStory(Number(releaseTicketId))
  ).data

  const re = new RegExp(releaseName)
  if (!releaseTicketContent.description.match(re)) {
    await shortcut.updateStory(Number(releaseTicketId), {
      description: `${releaseTicketContent.description} \n # ${projectName} [${releaseName}](${releaseUrl}) \n\n ${releaseContent}\n\n`
    })
  }
  core.info(`updated description of release ticket ${releaseTicketId}`)
}
