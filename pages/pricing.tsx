import cn from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Button,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

import { postData } from 'utils/helpers';
import { getStripe } from 'utils/stripe-client';
import { useUser } from 'utils/useUser';
import { Price, ProductWithPrice } from 'types';
import { getActiveProductsWithPrices } from '@/utils/supabase-client';
import { GetStaticPropsResult } from 'next';

interface Props {
  products: ProductWithPrice[];
}

type BillingInterval = 'year' | 'month';

export default function Pricing({ products }: Props ) {
  // console.log(products[0].prices)
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();
  // useEffect(() => {
  //   console.log("heelo")
  //   console.log(subscription)
  // }, [])
  
  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      return router.push('/signin');
    }
    if (subscription) {
      return router.push('/account');
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price }
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.log("shit")
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  if (!products.length)
    return (
      <VStack spacing={2} textAlign="center">
      <Heading as="h1" fontSize="4xl" mt={6}>
        No Products Found.
      </Heading>
       <a
        className="text-pink-500 underline"
        href="https://dashboard.stripe.com/products"
        rel="noopener noreferrer"
        target="_blank"
       >
        Stripe Dashboard
      </a>
     </VStack>
    );
  function PriceWrapper({ children }: { children: ReactNode }) {
      return (
        <Box
          className="card"
          w={{sm:'100%', md:'40%', lg:'40%'}}
          mb={4}
          shadow="2xl"
          borderWidth="1px"
          alignSelf={{ base: 'center', lg: 'flex-start' }}
          borderColor={useColorModeValue('gray.200', 'gray.500')}
          borderRadius={'xl'}>
          {children}
        </Box>
      );
  }
  return (
    <Box className="pricing" w='100%' h="100vh" minWidth="400px" paddingX={{sm:'5%', md:'8%', lg:'10%'}}
     display={'flex'} 
     flexDirection='column' alignItems="center">
        <VStack spacing={2} textAlign="center" w='100%'>
          <Heading as="h1" fontSize="4xl" mt={6}>
            plans that fit your need
          </Heading>
          {/* <Text fontSize="lg" color={'gray.500'}>
            Start with 14-day free trial. No credit card needed. Cancel at
            anytime.
          </Text> */}
        </VStack>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          w="95%"
          textAlign="center"
          justify="center"
          spacing={{ base: 4, lg: 10 }}
          py={10}>
          {products[0]?.prices?.map((price) => {
            // const price = price?.find(
            //   (price) => price.interval === billingInterval
            // );
            // if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency,
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);
            return (
                <PriceWrapper key={price.id}>
                  <Box py={4} px={12}>
                    <Text fontWeight="500" fontSize="2xl">
                    {"Yo"}
                    </Text>
                    <HStack justifyContent="center">
                    
                      <Text fontSize="5xl" fontWeight="900">
                      {priceString}
                      </Text>
                      <Text fontSize="3xl" color="gray.500">
                        /{billingInterval}
                      </Text>
                    </HStack>
                  </Box>
                  <VStack
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    py={4}
                    borderBottomRadius={'xl'}>
                    <List spacing={3} textAlign="start" px={12}>
                      <ListItem>
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        unlimited build minutes
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        Lorem, ipsum dolor.
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        5TB Lorem, ipsum dolor.
                      </ListItem>
                    </List>
                    <Box w="80%" pt={7}>
                      <Button w="full" colorScheme="red" variant="outline" onClick={() => handleCheckout(price)} disabled={isLoading} isLoading={priceIdLoading === price.id}>
                       
                        {price.id === subscription?.price_id ? 'Manage'
                              : 'Subscribe'}
                      </Button>
                        </Box>
                  </VStack>
                </PriceWrapper>
            );
          })}
        </Stack>
    </Box>
  );
}



export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const products = await getActiveProductsWithPrices();

  return {
    props: {
      products
    },
    revalidate: 60
  };
}
