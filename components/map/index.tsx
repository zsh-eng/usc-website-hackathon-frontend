import { Icon, LatLngExpression } from 'leaflet'
import dynamic from 'next/dynamic'
import { CSSProperties, ComponentType, FC } from 'react'
import { MarkerProps, PolygonProps, PolylineProps, PopupProps, TileLayerProps } from 'react-leaflet'

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false,
})

export type LeafletComponents = (
  { TileLayer, Marker, Popup, Polygon }: VenueMapProps,
  icon: typeof Icon,
  CustomMarker: FC<CustomMarkerProps>,
) => JSX.Element

export type VenueMapProps = {
  TileLayer: ComponentType<TileLayerProps>
  Marker: ComponentType<MarkerProps>
  Popup: ComponentType<PopupProps>
  Polygon: ComponentType<PolygonProps>
  Polyline: ComponentType<PolylineProps>
}

export type CustomMarkerProps = {
  position: LatLngExpression
  icon: Icon
  isShowPopup: boolean
  popupMessage: string
}

interface MapProps {
  width: string
  height: string
  center: number[]
  zoom: number
  children: LeafletComponents
}

const DEFAULT_WIDTH = '150'
const DEFAULT_HEIGHT = '100'

const Map = (props: MapProps) => {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props
  const style: CSSProperties = {
    aspectRatio: 2 / 1,
    width: width,
    height: height,
  }
  return (
    <div style={style}>
      <DynamicMap {...props} />
    </div>
  )
}

export default Map
