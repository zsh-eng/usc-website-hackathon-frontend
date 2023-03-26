import { useBoolean, VStack, Box, Text } from '@chakra-ui/react';
import { addMinutes, isAfter, isEqual } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { BoxProps } from '@chakra-ui/react';

// Types for the BookingsOld Components
// To be moved to global types file after replacing the old BookingsOld page
interface BookingVenueColumnProps extends React.HTMLProps<HTMLDivElement> {
  venueName: String;
  openBookingModal: (start: Date, end: Date) => void;
  bookingModalIsOpen: boolean;
  timeIntervals: Date[];
  currentVenueBookings: Array<BookingDataDisplay>;
  boxHeight: number;
  openBookingCard: (event: React.MouseEvent, booking: BookingDataDisplay) => void;
}

interface BookingVenueTimeCellProps extends React.HTMLProps<HTMLDivElement> {
  booked: boolean;
  selected: boolean;
  boxHeight: number;
  disabled: boolean;
}

// Detects clicks outside of the grid
function useOutsideAlerter(ref: any, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: any) =>
      ref.current && !ref.current.contains(event.target) && callback();

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

// Individual Grid Cells for the time intervals
const BookingVenueTimeCell: React.FC<BookingVenueTimeCellProps> = ({
  onMouseDown,
  onMouseOver,
  onMouseUp,
  onClick,
  booked,
  selected,
  boxHeight,
  disabled,
}) => {
  // Cell is coloured based on whether it's selected or not

  const SharedBoxProps: BoxProps = {
    w: '32',
    h: boxHeight,
    boxSizing: 'content-box',
    borderY: '.2rem solid',
    transition: '200ms ease-in',
  };

  if (booked) {
    return (
      <Box
        {...SharedBoxProps}
        bg='brand.secondary'
        borderColor='brand.secondary'
        // _hover={{ bg: 'green.600', borderColor: 'green.600', transition: 'none' }}
        cursor='pointer'
        onMouseUp={onMouseUp}
        onClick={onClick}
      />
    );
  } else if (disabled) {
    return <Box {...SharedBoxProps} bg='gray.300' borderColor='gray.300' onMouseUp={onMouseUp} />;
  } else if (selected) {
    return (
      <Box
        {...SharedBoxProps}
        bg='brand.success.light'
        borderColor='brand.success.light'
        _hover={{ bg: 'brand.success.dark', borderColor: 'brand.success.dark', transition: 'none' }}
        onMouseUp={onMouseUp}
      />
    );
  } else {
    return (
      <Box
        {...SharedBoxProps}
        bg='gray.100'
        borderColor='white'
        onMouseOver={onMouseOver}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        _hover={{ bg: 'gray.200', transition: 'none' }}
      />
    );
  }
};

// Column of Time Grid Cells for a single venue
const BookingVenueCol: React.FC<BookingVenueColumnProps> = ({
  venueName,
  openBookingModal,
  bookingModalIsOpen,
  timeIntervals,
  currentVenueBookings,
  boxHeight,
  openBookingCard,
}) => {
  // Helper function to check if the current cell is between the first and last selected cells
  const between = (currentIndex: number, x: number, y: number): boolean => {
    const startIndex = Math.min(x, y);
    const endIndex = Math.max(x, y);

    return currentIndex >= startIndex && currentIndex <= endIndex;
  };
  // Venue column works by colouring in cells between firstSelected and lastSelected
  // firstSelected is updated when user holds the mouse down
  // lastSelected is updated when cursor moves over a cell while mouse is held down
  const [mouseIsDown, setMouse] = useBoolean();
  const [firstSelected, setFirst] = useState(-1);
  const [lastSelected, setLast] = useState(-1);

  const wrapperRef = useRef(null); //  Used to detect clicks outside of the grid
  useOutsideAlerter(wrapperRef, () => {
    setMouse.off();
    setFirst(-1);
    setLast(-1);
  });

  const start = Math.min(firstSelected, lastSelected);
  const end = Math.max(firstSelected, lastSelected);

  return (
    <VStack ref={wrapperRef} spacing='0'>
      <Text
        fontSize='md'
        position='sticky'
        top='0'
        py='1'
        bg='brand.primary'
        color='white'
        alignSelf='stretch'
        textAlign='center'
      >
        {venueName}
      </Text>
      <VStack
        spacing='0'
        onMouseDown={setMouse.on}
        onMouseUp={() => {
          setMouse.off();
          if (firstSelected === -1) return;
          // If selection has been made, open the booking modal
          openBookingModal(timeIntervals[start], addMinutes(timeIntervals[end], 30));
        }}
      >
        {timeIntervals.map((el, i) => {
          // Check if the current cell is booked
          const venueBooking = currentVenueBookings.find((booking) => {
            return (
              (isEqual(el, booking.from) || isAfter(el, booking.from)) && isAfter(booking.to, el)
            );
          });
          const isBooked = venueBooking !== undefined;

          // Prevent having an existing booking between start and end
          // Prevent selecting a time in the past
          const isDisabled =
            currentVenueBookings.some((booking) => {
              const startInterval = timeIntervals[start];
              return (
                (isAfter(booking.from, startInterval) && isAfter(el, booking.from)) ||
                (isAfter(startInterval, booking.from) && isAfter(booking.from, el))
              );
            }) || isAfter(new Date(), el);

          return (
            <BookingVenueTimeCell
              key={i}
              booked={isBooked}
              onMouseDown={() => {
                setFirst(i);
                setLast(i);
              }}
              onMouseOver={() => {
                if (mouseIsDown && !isBooked) setLast(i);
              }}
              onClick={(e) => {
                if (venueBooking !== undefined) openBookingCard(e, venueBooking);
              }}
              selected={!isBooked && between(i, firstSelected, lastSelected)}
              disabled={isDisabled}
              boxHeight={boxHeight}
            />
          );
        })}
      </VStack>
    </VStack>
  );
};

export default BookingVenueCol;
