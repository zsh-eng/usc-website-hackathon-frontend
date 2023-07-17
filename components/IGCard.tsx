import {
  Button,
  Card,
  CardBody,
  Heading,
  Box,
  Center,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import Link from 'next/link'
import ImageWithFallback from './ImageWithFallback'
import { DEFAULT_PNG_NAME } from '../utils'

interface IGInfoProps {
  ig_info: OrganisationWithIGHead
  imageKey: number
}

type LeftPaneProps = {
  imageKey: number
  primaryIGHead: User | null
  imageSrc: string
  inviteLink: string
  isInactive: boolean
}

const MotionBox = motion(Box)

const getContactButton = (contact: User | null, width?: string) => {
  const toast = useToast()

  const copyToClipboard = () => {
    const nameToCopy = contact?.name || 'No contact found'
    navigator.clipboard.writeText(nameToCopy)

    // Show toast alert
    toast({
      title: 'Copied to clipboard!',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'bottom',
    })
  }

  const isContactFound = contact !== null && contact.name !== undefined

  return (
    <Button
      overflow='hidden'
      textOverflow={'ellipsis'}
      leftIcon={<FaUserCircle />}
      variant='outline'
      colorScheme='blue'
      minWidth={width || 'auto'}
      maxWidth={width || 'auto'}
      rounded='15px'
      style={{
        borderRadius: '0.5rem',
        color: '#1f407b',
        border: '1px solid #1f407b',
        display: 'flex',
        alignItems: 'center',
      }}
      onClick={copyToClipboard}
      // isDisabled={!isContactFound}
      isDisabled={true}
    >
      <Text noOfLines={[1]} display='inline'>
        {contact?.name || 'No contact found'}
      </Text>
    </Button>
  )
}

const getInviteLinkButton = (inviteLink: string, width?: string) => {
  return (
    <Link href={inviteLink} rel='noopener noreferrer' target='_blank'>
      <Button
        overflow='hidden'
        textOverflow={'ellipsis'}
        variant='outline'
        colorScheme='blue'
        minWidth={width || 'auto'}
        maxWidth={width || 'auto'}
        rounded='15px'
        style={{ borderRadius: '0.5rem', color: '#229ed9', border: '1px solid #229ed9' }}
      >
        Invite Link
      </Button>
    </Link>
  )
}

const LeftPane: React.FC<LeftPaneProps> = ({
  imageKey,
  primaryIGHead,
  imageSrc,
  inviteLink,
  isInactive,
}) => {
  return (
    <VStack padding='1rem' borderRight='2px solid darkgrey' justifyContent='space-apart'>
      <Center flex={1}>
        <ImageWithFallback
          key={imageKey}
          fallbackSrc={'/orgs/' + DEFAULT_PNG_NAME}
          width={100}
          height={100}
          src={imageSrc}
          alt={imageSrc}
          style={{ objectFit: 'contain' }}
          sizes='(max-width: 130) 100vw'
        />
        {isInactive ? (
          <Box
            position='absolute'
            top={2}
            right={2}
            bg='red.500'
            color='white'
            px={2}
            py={1}
            borderRadius='md'
            fontSize='sm'
            fontWeight='bold'
          >
            Inactive
          </Box>
        ) : (
          <></>
        )}
      </Center>
      {getContactButton(primaryIGHead, '7vw')}
      {getInviteLinkButton(inviteLink, '7vw')}
    </VStack>
  )
}

const IGCard: React.FC<IGInfoProps> = ({ imageKey, ig_info }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const igHeads: UserOnOrg[] = ig_info.userOrg.filter((userOnOrg) => userOnOrg.isIGHead)
  const igHeadsNames: string[] = igHeads.map((igHead) => igHead.user.name)
  const igHeadsDisplay: string =
    igHeadsNames.length > 0
      ? igHeadsNames.length === 1
        ? igHeadsNames[0]
        : igHeadsNames.join(', ')
      : 'No IG Heads'
  const primaryIGHead: User | null = igHeads.length > 0 ? igHeads[0].user : null
  const slug = ig_info.slug || DEFAULT_PNG_NAME
  const imageSrc = '/orgs/' + slug + '.png'
  const inviteLink =
    ig_info.inviteLink ||
    (igHeads.length > 0 ? 'https://t.me/' + primaryIGHead?.telegramUserName : '')

  return (
    <>
      <MotionBox
        whileHover={{ scale: 1.03, cursor: 'pointer' }}
        transition={{ duration: 0.3 }}
        style={{ minWidth: '100%', minHeight: '15rem' }}
      >
        <Card
          direction={{ base: 'column', sm: 'row' }}
          overflow='hidden'
          variant='outline'
          shadow='md'
          onClick={onOpen}
          style={{ height: '100%' }}
        >
          <LeftPane
            imageKey={imageKey - 1}
            primaryIGHead={primaryIGHead}
            imageSrc={imageSrc}
            inviteLink={inviteLink}
            isInactive={ig_info.isInactive}
          />
          <Divider orientation='vertical' h='85%' my='auto' />
          <Center>
            <CardBody>
              <Heading fontSize={'2xl'} fontFamily={'body'}>
                {ig_info.name}
              </Heading>
              <Text
                color='gray.500'
                pt='1vh'
                css={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {ig_info.description}
              </Text>
            </CardBody>
          </Center>
        </Card>
      </MotionBox>

      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          {ig_info.isInactive ? (
            <Box
              position='absolute'
              top={2}
              left={2}
              bg='red.500'
              color='white'
              px={2}
              py={1}
              borderRadius='md'
              fontSize='md'
              fontWeight='bold'
            >
              Inactive
            </Box>
          ) : (
            <></>
          )}
          <Center>
            <ImageWithFallback
              key={imageKey}
              fallbackSrc={'/orgs/' + DEFAULT_PNG_NAME}
              src={imageSrc}
              alt='Modal Image'
              width={300}
              height={300}
              style={{ padding: '2rem', objectFit: 'contain' }}
              sizes='(max-height: 350) 100vh'
            />
          </Center>

          <ModalHeader>{ig_info.name}</ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <Text color={'gray.500'}>{'Heads: ' + igHeadsDisplay}</Text>
            <Text color={'gray.500'}>{ig_info.description}</Text>
          </ModalBody>
          <ModalFooter justifyContent='flex-start'>
            <Box mr={2}>{getContactButton(primaryIGHead)}</Box>
            {getInviteLinkButton(inviteLink)}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default IGCard
