import Link from 'next/link';
import { useState, ReactNode } from 'react';

import { useUser } from 'utils/useUser';
import { postData } from 'utils/helpers';

import { User } from '@supabase/supabase-js';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';

import {Box,Text, Button, Stack, Flex}  from '@chakra-ui/react';
import Spinner from '@/components/ui/Spinner';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <Box color='black' 
      display="flex" 
      flexDirection='column' 
      w='100%'  
      borderWidth='1px' 
      borderRadius='lg' 
      overflow='hidden' 
      shadow="2xl" 
      mb={4}
      p={4}>
      <Text fontWeight="bold" fontSize={'lg'}>{title}</Text >
      <Text fontSize={'sm'}>{description}</Text>
      {children}
      {footer && <Box borderTop="1px" w='100%' borderColor='gray.300' p={2} mt={2}>  {footer}</Box>}
    </Box>
    
  );
}

export const getServerSideProps = withPageAuth({ redirectTo: '/signin' });

export default function Account({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const { isLoading, subscription, userDetails } = useUser();

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link'
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    finally{setLoading(false);}
  };

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);
  return (
    <Box w="100%" paddingX={['2%','10%','25%']}>
      <Text mb="3rem" fontSize="3rem" fontWeight="bold" color="white">account</Text>
      <Card
          title="Your Plan"
          description={
            subscription
              ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
              : ''
          }
          footer={
            <Flex direction={'row'} justify="space-between" align="center">
              <div>
                Manage your subscription on Stripe.
              </div>
              <Button
                isLoading ={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'green.500'}
                _hover={{
                  bg: 'green.300',
                }}
              >
                Open customer portal
              </Button>
            </Flex>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold">
            {isLoading ? (
              <div className="h-12 mb-6">
                <Spinner />
              </div>
            ) : subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <Link href="/">
                <a>Choose your plan</a>
              </Link>
            )}
          </div>
        </Card>
        <Card
          title="Your Email"
          description=""
          // footer={}
        >
          <p className="text-xl mt-8 mb-4 font-semibold">
            {user ? user.email : undefined}
          </p>
        </Card>
    </Box>
  );
}
