import { Page, Spinner } from "@shopify/polaris";


export default function LoadingSpinner () {
  return (
    <Page>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
      }}>
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
    </Page>
  )
}