import * as R from 'ramda'
import * as github from '@actions/github'

export async function getRelease({
  releaseName,
  token,
  repo,
  owner
}: {
  releaseName: string
  token: string
  repo: string
  owner: string
}): Promise<{
  body: string
  id: number
  name: string
  html_url: string
}> {
  const githubClient = github.getOctokit(token).rest
  const release = (
    await githubClient.repos.getReleaseByTag({
      owner,
      repo,
      tag: releaseName
    })
  ).data

  if (!release?.body) {
    throw new Error(`Cannot find release ${releaseName}`)
  }
  return {
    body: release.body || '',
    id: release.id,
    name: release.name || release.tag_name,
    html_url: release.html_url
  }
}

export function getStoryIdsFromRelease({
  content,
  rex
}: {
  content: string
  rex: RegExp
}): string[] {
  const tickets: string[] = []
  let m
  do {
    m = rex.exec(content)
    if (m && m[1]) {
      tickets.push(m[1])
    }
  } while (m)
  return R.uniq(tickets)
}
