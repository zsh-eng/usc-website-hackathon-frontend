import { useLocalStorageWithPersistence } from '../components/swr-internal-state-main'

export const useIdsToColoursMap = () =>
  useLocalStorageWithPersistence<NumberToStringJSObject>('org-ids-to-colours-map', {})
