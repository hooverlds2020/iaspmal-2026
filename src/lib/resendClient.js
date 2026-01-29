const SUPABASE_URL = 'https://rvpovifwugksrsmgabcj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cG92aWZ3dWdrc3JzbWdhYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUwODYsImV4cCI6MjA3NTM2MTA4Nn0.Qyqsj8uoMinKkx5DrmiFaZpEJtzz3ZH_HnciDZNv1r0';

export const sendRegistrationConfirmation = async (email, name) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-registration-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error sending email:', data);
      return { success: false, error: data };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendPaymentApproval = async (email, name) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-approval-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error sending email:', data);
      return { success: false, error: data };
    }

    console.log('Approval email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendRejectionNotice = async (email, name) => {
  try {
    // Por ahora usa la misma función de registro
    // Puedes crear una tercera Edge Function si quieres un mensaje diferente
    console.log('Rejection notice (manual por ahora)');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
