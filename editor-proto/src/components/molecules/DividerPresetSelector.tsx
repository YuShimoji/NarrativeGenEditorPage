import React from 'react'
import { Button, Select, Input } from '../atoms'
import { DIVIDER_PRESETS } from '../../constants/config'
import { DividerStyle } from '../../types'

export interface DividerPresetSelectorProps {
  selectedStyle: DividerStyle
  customText?: string
  onStyleChange: (style: DividerStyle) => void
  onTextChange?: (text: string) => void
  className?: string
}

export const DividerPresetSelector: React.FC<DividerPresetSelectorProps> = ({
  selectedStyle,
  customText = '',
  onStyleChange,
  onTextChange,
  className = ''
}) => {
  const selectedPreset = DIVIDER_PRESETS.find(preset => preset.style === selectedStyle)

  const handlePresetSelect = (presetId: string) => {
    const preset = DIVIDER_PRESETS.find(p => p.id === presetId)
    if (preset) {
      onStyleChange(preset.style)
      if (preset.style !== 'custom') {
        onTextChange?.(preset.defaultText)
      }
    }
  }

  const presetOptions = DIVIDER_PRESETS.map(preset => ({
    value: preset.id,
    label: `${preset.icon} ${preset.label}`,
    disabled: false
  }))

  const renderPreview = () => {
    if (!selectedPreset) return null

    const displayText = selectedStyle === 'custom' ? customText : selectedPreset.defaultText

    switch (selectedStyle) {
      case 'simple':
        return <hr className="border-gray-300" />
      case 'ornate':
        return <div className="text-center text-gray-500 font-serif">{displayText}</div>
      case 'dotted':
        return <div className="text-center text-gray-400 tracking-widest">{displayText}</div>
      case 'stars':
        return <div className="text-center text-yellow-500">{displayText}</div>
      case 'custom':
        return <div className="text-center text-gray-600">{displayText || 'カスタムテキストを入力してください'}</div>
      default:
        return <hr className="border-gray-300" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Select
          label="区切り線プリセット"
          options={presetOptions}
          value={selectedPreset?.id || 'simple'}
          onChange={(e) => handlePresetSelect(e.target.value)}
          fullWidth
        />
      </div>

      {selectedStyle === 'custom' && (
        <div>
          <Input
            label="カスタムテキスト"
            value={customText}
            onChange={(e) => onTextChange?.(e.target.value)}
            placeholder="区切り線のテキストを入力..."
            fullWidth
          />
        </div>
      )}

      {selectedPreset && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedPreset.icon}</span>
            <h4 className="font-medium text-gray-900">{selectedPreset.label}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedPreset.description}</p>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-500">プレビュー:</div>
            <div className="bg-white p-3 rounded border">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
