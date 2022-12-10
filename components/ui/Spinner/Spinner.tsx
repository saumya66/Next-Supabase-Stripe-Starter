import { Spinner } from '@chakra-ui/react';

const SpinnerIcon = () => {
  return (
    <Spinner
      thickness='4px'
      speed='0.65s'
      emptyColor='gray.200'
      color='green.500'
      size='xl'
    />
  );
};

export default SpinnerIcon;
