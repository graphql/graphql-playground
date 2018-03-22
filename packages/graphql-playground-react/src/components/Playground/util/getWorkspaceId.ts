export function getWorkspaceId(props: {
  configPath?: string
  workspaceName?: string
  endpoint?: string
}) {
  const configPathString = props.configPath ? `${props.configPath}~` : ''
  const workspaceNameString = props.workspaceName
    ? `${props.workspaceName}~`
    : ''
  return `${configPathString}${workspaceNameString}${props.endpoint}`
}
