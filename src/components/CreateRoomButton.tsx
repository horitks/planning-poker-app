import { Button, useDisclosure, useToast } from '@chakra-ui/react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DEFAULT_NICKNAME } from '../const'
import { db } from '../firebase'
import StorageService from '../services/storage'
import CreateRoomModal from './CreateRoomModal'

const CreateRoomButton: React.FC = () => {
  const navigate = useNavigate()

  const [nicknameInput, setNicknameInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const toast = useToast()

  const handleNicknameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNicknameInput(e.target.value)
  }

  const handleCreateRoomButtonClick = async () => {
    try {
      setIsLoading(true)

      const roomsCollectionRef = collection(db, 'rooms')
      const addRoomDocRef = await addDoc(roomsCollectionRef, {
        active: true,
        revealed: false,
        createdAt: serverTimestamp(),
      })

      const participantsCollectionRef = collection(
        db,
        'rooms',
        addRoomDocRef.id,
        'participants',
      )

      const addParticipantDocRef = await addDoc(participantsCollectionRef, {
        name: nicknameInput !== '' ? nicknameInput : DEFAULT_NICKNAME,
        estimate: '',
        owner: true,
        createdAt: serverTimestamp(),
      })

      StorageService.addParticipantId(addParticipantDocRef.id)
      navigate(`/room/${addRoomDocRef.id}`)
    } catch (error) {
      toast({
        title: 'Room creation is failed.',
        description: 'Please try again.',
        status: 'error',
        position: 'top',
        isClosable: true,
      })

      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        color="white"
        colorScheme="cyan"
        onClick={onOpen}
        mt="16px"
        width="160px"
      >
        Create new room
      </Button>

      <CreateRoomModal
        isOpen={isOpen}
        isLoading={isLoading}
        nicknameInput={nicknameInput}
        onClose={onClose}
        handleNicknameInputChange={handleNicknameInputChange}
        handleCreateRoomButtonClick={handleCreateRoomButtonClick}
      />
    </>
  )
}

export default CreateRoomButton
