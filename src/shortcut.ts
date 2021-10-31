import * as R from 'ramda'
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
  await shortcut.updateStory(Number(storyId), {
    workflow_state_id: stateId
  })
  await shortcut.createStoryLink({
    object_id: Number(releaseTicketId),
    subject_id: Number(storyId),
    verb: 'relates to'
  })
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
}
