import React from 'react'
import { Button, Select } from '../atoms'
import { CHOICE_PRESETS } from '../../constants/config'
import { ChoiceStyle } from '../../types'

export interface ChoicePresetSelectorProps {
  selectedStyle: ChoiceStyle
  onStyleChange: (style: ChoiceStyle) => void
  onTextChange?: (text: string) => void
  className?: string
}

export const ChoicePresetSelector: React.FC<ChoicePresetSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  onTextChange,
  className = ''
}) => {
  const selectedPreset = CHOICE_PRESETS.find(preset => preset.style === selectedStyle)

  const handlePresetSelect = (presetId: string) => {
    const preset = CHOICE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      onStyleChange(preset.style)
      onTextChange?.(preset.defaultText)
    }
  }

  const presetOptions = CHOICE_PRESETS.map(preset => ({
    value: preset.id,
    label: `${preset.icon} ${preset.label}`,
    disabled: false
  }))

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Select
          label="選択肢プリセット"
          options={presetOptions}
          value={selectedPreset?.id || 'normal'}
          onChange={(e) => handlePresetSelect(e.target.value)}
          fullWidth
        />
      </div>

      {selectedPreset && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedPreset.icon}</span>
            <h4 className="font-medium text-gray-900">{selectedPreset.label}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedPreset.description}</p>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-500">プレビュー:</div>
            <Button
              variant={selectedPreset.style === 'important' ? 'primary' : 
                     selectedPreset.style === 'dangerous' ? 'danger' : 
                     selectedPreset.style === 'disabled' ? 'secondary' : 'outline'}
              disabled={selectedPreset.style === 'disabled'}
              className={`${selectedPreset.cssClass} pointer-events-none`}
            >
              {selectedPreset.defaultText}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
