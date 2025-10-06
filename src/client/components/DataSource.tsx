import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { BrandConfig } from '../modules/Config.js';
import type { PurchaseHistory } from '../modules/DataTransformSchema.js';
import { transformData } from '../modules/DataTransformSchema.js';
import { Button } from '@/components/ui/button.js';
import { Badge } from '@/components/ui/badge.js';

interface DataSourceProps {
  onSuccessConnect: (data: PurchaseHistory[]) => void;
  disabled?: boolean;
  brandConfig: BrandConfig;
  isConnected?: boolean;
}

const getPurchaseHistory = async (brandConfig: BrandConfig) => {
  const response = await fetch(
    `/getgather/purchase-history/${brandConfig.brand_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  let purchaseHistory: PurchaseHistory[] = [];

  if (data.content) {
    const transformedData = transformData(
      data.content,
      brandConfig.dataTransform
    );
    purchaseHistory = transformedData.map((item) => ({
      brand: brandConfig.brand_name,
      order_date: (item.order_date as Date) || null,
      order_total: item.order_total as string,
      order_id: item.order_id as string,
      product_names: item.product_names as string[],
      image_urls: item.image_urls as string[],
    }));
  }

  return {
    linkId: data.link_id,
    hostedLinkURL: data.hosted_link_url,
    purchaseHistory: purchaseHistory,
  };
};

const pollForAuthCompletion = async (linkId: string) => {
  const response = await fetch(`/getgather/mcp-poll/${linkId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.auth_completed) {
    return true;
  }

  throw new Error('Sign in failed or timed out');
};

type ConnectionStep =
  | 'initial'
  | 'connecting'
  | 'authenticating'
  | 'retrieving'
  | 'completed';

export function DataSource({
  onSuccessConnect,
  disabled,
  brandConfig,
  isConnected,
}: DataSourceProps) {
  const [connectionStep, setConnectionStep] =
    useState<ConnectionStep>('initial');

  const handleConnect = async () => {
    setConnectionStep('connecting');
    try {
      const result = await getPurchaseHistory(brandConfig);

      // got nothing
      if (
        !result.linkId &&
        !result.hostedLinkURL &&
        result.purchaseHistory.length == 0
      ) {
        throw new Error('No data received from MCP service');
      }

      // If we already have purchase history, use it directly
      if (result.purchaseHistory && result.purchaseHistory.length > 0) {
        setConnectionStep('completed');
        onSuccessConnect(result.purchaseHistory);
        return;
      }

      setConnectionStep('authenticating');

      // Open hosted link in pop up window for authentication
      window.open(
        result.hostedLinkURL,
        '_blank',
        'width=500,height=600,menubar=no,toolbar=no,location=no,status=no'
      );

      // Wait until auth successful
      while (true) {
        try {
          const authCompleted = await pollForAuthCompletion(result.linkId);
          if (authCompleted) {
            break;
          }
        } catch (error) {
          console.error('Failed to poll for auth completion:', error);
        }
      }

      setConnectionStep('retrieving');

      // Fetch purchase history after authentication
      const updatedResult = await getPurchaseHistory(brandConfig);

      setConnectionStep('completed');
      onSuccessConnect(updatedResult.purchaseHistory);
    } catch (error) {
      console.error('Failed to create hosted link:', error);
      setConnectionStep('initial');
    } finally {
      // Wait a moment to show the success animation
      setTimeout(() => {
        setConnectionStep('initial');
      }, 1.5 * 1000);
    }
  };

  const renderStepIndicators = () => {
    const steps = [
      {
        key: 'connecting',
        label: 'Connecting',
        color: 'bg-blue-500',
      },
      {
        key: 'authenticating',
        label: 'Signing in',
        color: 'bg-yellow-500',
      },
      {
        key: 'retrieving',
        label: 'Retrieving',
        color: 'bg-green-500',
      },
    ];

    const currentStep = steps.find((step) => step.key === connectionStep);

    return (
      <>
        <div className="flex flex-col items-center gap-1 text-xs text-gray-700 font-medium mb-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          {currentStep?.label}
        </div>
        <div className="flex space-x-1 mt-1">
          {steps.map((step, index) => {
            const isActive = connectionStep === step.key;
            const isCompleted =
              connectionStep === 'completed' ||
              (connectionStep !== 'initial' &&
                !isActive &&
                ['connecting', 'authenticating', 'retrieving'].indexOf(
                  connectionStep
                ) > index);

            return isActive ? (
              <span key={step.key} className="relative flex size-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${step.color} opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex size-2 rounded-full ${step.color}`}
                ></span>
              </span>
            ) : (
              <div
                key={step.key}
                className={`w-2 h-2 rounded-full transition-all duration-300 shadow-2xs ${
                  isCompleted ? step.color : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </>
    );
  };

  const renderSuccessAnimation = () => {
    if (connectionStep === 'completed') {
      return (
        <div className="mt-1 flex justify-center">
          <div className="w-8 h-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-green-500 animate-bounce"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        className={`flex flex-col items-center justify-between w-20 min-h-32 p-3 space-y-1 relative`}
      >
        {/* Logo - Fixed size container */}
        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
          <img
            src={brandConfig.logo_url}
            alt={`${brandConfig.brand_name} logo`}
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Brand Name - Fixed height container */}
        <div className="text-center h-9 flex flex-col justify-center flex-shrink-0">
          <h3 className="text-xs font-medium text-gray-900 leading-tight line-clamp-2">
            {brandConfig.brand_name}
          </h3>
          {brandConfig.is_mandatory && (
            <span className="text-xs text-gray-500 leading-tight">
              Required
            </span>
          )}
        </div>

        {/* Connect Button - Fixed height */}
        <div className="flex-shrink-0">
          {isConnected ? (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Connected
            </Badge>
          ) : (
            <Button
              disabled={disabled}
              onClick={handleConnect}
              size="sm"
              variant="outline"
              className="text-xs px-3 py-1 h-7"
            >
              Connect
            </Button>
          )}

          {/* Loading indicator */}
          {connectionStep !== 'initial' && (
            <div
              className={`absolute inset-0 ${connectionStep !== 'completed' ? 'bg-gray-200/95' : 'bg-green-200/95'} rounded-lg flex flex-col items-center justify-center z-10 transition-colors duration-300`}
            >
              {connectionStep !== 'completed'
                ? renderStepIndicators()
                : renderSuccessAnimation()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
