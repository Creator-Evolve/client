import { Popover, PopoverContent,PopoverTrigger } from '@/components/ui/popover';
import React from 'react'
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fonts } from '@/components/reel-generator/types/font';
import { ITextStyle } from '../ImageEditor';


const fontSizes = [
  { label: "Extra Small", value: "37px" },
  { label: "Small", value: "42px" },
  { label: "Medium Small", value: "48px" },
  { label: "Medium", value: "53px" },
  { label: "Medium Large", value: "58px" },
  { label: "Large", value: "64px" },
  { label: "Extra Large", value: "69px" },
  { label: "XX Large", value: "74px" },
  { label: "XXX Large", value: "80px" },
];


interface IProps {
  handleTextStyle: (style: Partial<ITextStyle>) => void
}

const TextOptions: React.FC<IProps> = ({
  handleTextStyle
}) => {
  const [fillColor, setFillColor] = useColor("#fffff")
  const [textColor, setTextColor] = useColor("#00000")

  return (
    <div className="flex gap-5 " >
      <div className="flex flex-col items-center justify-start">
        <p className="text-xs font-medium">Fill Color</p>
        <Popover>
          <PopoverTrigger>
            <div className="w-6 h-6 rounded-full border" style={{ background: fillColor.hex }} />
          </PopoverTrigger>
          <PopoverContent>
            <ColorPicker color={fillColor} onChange={(color) => {
              setFillColor(color)
              handleTextStyle({ background: color.hex })
            }} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center justify-start">
        <p className="text-xs font-medium">Text Color</p>
        <Popover>
          <PopoverTrigger>
            <div className="w-6 h-6 rounded-full border" style={{ background: textColor.hex }} />
          </PopoverTrigger>
          <PopoverContent>
            <ColorPicker color={textColor} onChange={(color) => {
              setTextColor(color)
              handleTextStyle({ color: textColor.hex })
            }} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col items-center justify-start">
        <p className="text-xs font-medium mb-1">Font</p>
        <Select onValueChange={(val) => handleTextStyle({ font: val })}>
          <SelectTrigger className="w-[200px]  focus:ring-0 focus:border-none">
            <SelectValue placeholder="Arial" className='outline-none border-none' />
          </SelectTrigger>
          <SelectContent className='outline-none border-none'>
            {
              fonts.map(font => (
                <SelectItem key={font.name} value={font.css}>{font.name}</SelectItem>
              ))
            }

          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col items-center justify-start">
        <p className="text-xs font-medium mb-1">Font Size</p>
        <Select onValueChange={(val) => handleTextStyle({ fontSize: val })}>
          <SelectTrigger className="w-[200px]  focus:ring-0 focus:border-none">
            <SelectValue placeholder={fontSizes[0].label} className='outline-none border-none' />
          </SelectTrigger>
          <SelectContent className='outline-none border-none'>
            {
              fontSizes.map(font => (
                <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
              ))
            }

          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default TextOptions