import React, { useState } from 'react';
import { askAI } from '../api';

/**
 * AskAI component for AI-powered Q&A about repositories
 */
const AskAI = ({ repoData }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  // Predefined questions for quick access
  const predefinedQuestions = [
    'How active is this repository?',
    'What is the health score of this repository?',
    'Is this repository trending up or down?',
    'How many contributors does this repository have?',
    'What are the main advantages of this repository?',
    'Should I contribute to this repository?',
    'Is this repository well-maintained?',
    'What is the development velocity like?'
  ];

  // Handle question submission
  const handleAsk = async (questionText) => {
    const questionToAsk = questionText || question;
    
    if (!questionToAsk.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!repoData) {
      setError('Please analyze a repository first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await askAI(questionToAsk, repoData);
      
      // Add to conversation history
      const newEntry = {
        id: Date.now(),
        question: questionToAsk,
        response: result.response,
        timestamp: new Date().toISOString()
      };
      
      setConversationHistory(prev => [newEntry, ...prev]);
      setResponse(result);
      setQuestion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle predefined question click
  const handlePredefinedQuestion = (predefinedQuestion) => {
    setQuestion(predefinedQuestion);
    handleAsk(predefinedQuestion);
  };

  // Clear conversation
  const handleClearConversation = () => {
    setConversationHistory([]);
    setResponse(null);
    setError('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
        {conversationHistory.length > 0 && (
          <button
            onClick={handleClearConversation}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>

      {!repoData ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Please analyze a repository first to ask questions about it</span>
          </div>
        </div>
      ) : (
        <>
          {/* Repository Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Currently Analyzing:</p>
                <p className="text-sm text-blue-700">{repoData.repoName}</p>
              </div>
            </div>
          </div>

          {/* Predefined Questions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {predefinedQuestions.map((predefinedQuestion, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedQuestion(predefinedQuestion)}
                  className="text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  {predefinedQuestion}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask a Question
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask anything about this repository..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isLoading || !question.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Asking...' : 'Ask'}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation History</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    
                    {/* Question */}
                    <div className="mb-3">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          Q
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{entry.question}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Response */}
                    <div>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                          A
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed">{entry.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Response */}
          {response && !isLoading && conversationHistory.length === 0 && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">AI Response:</h4>
                  <p className="text-green-800 leading-relaxed">{response.response}</p>
                  <div className="text-xs text-green-600 mt-2">
                    Responded at {formatTime(response.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Tips for better answers:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>Be specific about metrics (activity, health, contributors)</li>
                  <li>Ask about trends, comparisons, or recommendations</li>
                  <li>Include context about what you want to achieve</li>
                  <li>Use the quick questions for common inquiries</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AskAI;
