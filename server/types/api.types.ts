export enum UsageKeys {
  publicSnippets = 'publicSnippets',
  privateSnippets = 'privateSnippets',
  publicCollections = 'publicCollections',
  privateCollections = 'privateCollections',
  snippetVersions = 'snippetVersions',
  teamMembers = 'teamMembers',
  aiRequests = 'aiRequests',
  aiTokens = 'aiTokens',
}

export interface SnippetVersion {
  id: string
  version: string
  is_latest: boolean
}
