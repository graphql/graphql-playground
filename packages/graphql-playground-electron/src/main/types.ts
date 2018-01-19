import { BrowserWindow } from 'electron'

export interface WindowContext {
  readyWindowsPromises: { [windowId: number]: Promise<void> }
  windows: Set<BrowserWindow>
  windowById: Map<number, BrowserWindow>
  windowByPath: Map<string, BrowserWindow>
}
