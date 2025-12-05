'use client'

import { WindowControls } from '@/components/ui/window-controls'
import { CloseIcon, ExpandIcon, RemoveIcon } from '@/components/ui/icons'

export function WindowControlsPreview() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          Default
        </h3>
        <div className="flex items-center gap-3">
          <WindowControls
            closeIcon={<CloseIcon />}
            minimizeIcon={<RemoveIcon />}
            maximizeIcon={<ExpandIcon />}
            onClose={() => console.log('close')}
            onMinimize={() => console.log('minimize')}
            onMaximize={() => console.log('maximize')}
          />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          Usage
        </h3>
        <p className="text-sm text-muted-foreground">
          WindowControls provides three buttons for window management: close,
          minimize, and maximize. Pass custom icons and handlers for each action.
        </p>
      </div>
    </div>
  )
}

