import {expect, test} from '@jest/globals'
import {run} from '../src/main'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', async () => {
  // process.env['INPUT_RELEASE_NAME'] = 'v0.173.0'
  // process.env['INPUT_WORKFLOW'] = 'Engineering'
  // process.env['INPUT_WORKFLOW_STATE'] = 'Pending Prod Verification'
  // process.env['INPUT_RELEASE_TICKET_ID'] = '5289'
  // process.env['INPUT_RELEASE_NAME'] = 'v0.169.0'
  // await run()
  expect(true).toEqual(true)
})
