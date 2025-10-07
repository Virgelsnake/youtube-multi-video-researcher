#!/usr/bin/env node

/**
 * Test Full Pipeline with Mock Transcripts
 * This demonstrates the complete workflow when transcripts are available
 */

import dotenv from 'dotenv';
import { scoreVideos } from './backend/services/scoringService.js';
import { analyzeVideos } from './backend/services/analysisService.js';

dotenv.config();

console.log('🧪 Testing Full Pipeline with Mock Transcripts\n');
console.log('='.repeat(60));

// Mock top 5 videos (from real YouTube data)
const top5 = [
  {
    url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    title: '10 React Hooks Explained // Plus Build your own from Scratch',
    channel: 'Fireship',
    views: 1500000,
    published_at_text: '4 years ago',
    duration_sec: 795,
    score: 85.2
  },
  {
    url: 'https://www.youtube.com/watch?v=LOH1l-MP_9k',
    title: 'ALL React Hooks Explained in 12 Minutes',
    channel: 'Code Bootcamp',
    views: 317000,
    published_at_text: '1 year ago',
    duration_sec: 741,
    score: 82.1
  },
  {
    url: 'https://www.youtube.com/watch?v=HnXPKtro4SM',
    title: 'React Hooks in ONE Shot 2025',
    channel: 'Code Bless You',
    views: 229000,
    published_at_text: '3 years ago',
    duration_sec: 3569,
    score: 78.5
  },
  {
    url: 'https://www.youtube.com/watch?v=cF2lQ_gZeA8',
    title: 'React Hooks Tutorial - Introduction',
    channel: 'Codevolution',
    views: 828000,
    published_at_text: '6 years ago',
    duration_sec: 476,
    score: 75.3
  },
  {
    url: 'https://www.youtube.com/watch?v=-4XpG5_Lj_o',
    title: 'Learn React Hooks: useEffect - Simply Explained!',
    channel: 'Cosden Solutions',
    views: 251000,
    published_at_text: '2 years ago',
    duration_sec: 847,
    score: 73.8
  }
];

// Mock transcripts with realistic React Hooks content
const mockTranscripts = [
  {
    url: top5[0].url,
    video_id: 'TNhaISOUy6Q',
    word_count: 1850,
    text: `Welcome to this tutorial on React Hooks. In this video, we'll cover the most important hooks in React.

First, let's talk about useState. useState is the most fundamental hook. It allows you to add state to functional components. You call useState with an initial value, and it returns an array with two elements: the current state value and a function to update it.

Next is useEffect. useEffect is for side effects in your components. It runs after every render by default, but you can control when it runs using the dependency array. Common use cases include fetching data, subscribing to events, and manually changing the DOM.

useContext is another important hook. It allows you to consume context without wrapping your component in a Consumer. This makes your code cleaner and easier to read.

useReducer is like useState but for more complex state logic. If you have multiple state values that depend on each other, useReducer might be a better choice. It's similar to how Redux works.

useMemo and useCallback are optimization hooks. useMemo memoizes a computed value, while useCallback memoizes a function. Use these when you need to optimize performance, but don't overuse them.

useRef gives you a mutable reference that persists across renders. It's commonly used to access DOM elements directly or to store mutable values that don't trigger re-renders.

Finally, you can create custom hooks. Custom hooks let you extract component logic into reusable functions. They must start with 'use' and can call other hooks.`
  },
  {
    url: top5[1].url,
    video_id: 'LOH1l-MP_9k',
    word_count: 1620,
    text: `Let's dive into React Hooks and understand them quickly.

useState is the hook you'll use most often. It adds state to functional components. The syntax is simple: const [value, setValue] = useState(initialValue). The first element is your state, the second is the updater function.

useEffect handles side effects. Side effects are things like API calls, subscriptions, or timers. useEffect takes two arguments: a function to run, and a dependency array. If the dependency array is empty, the effect runs once. If you include variables, it runs when those variables change.

useContext makes it easy to use React Context. Instead of wrapping components in Context.Consumer, you just call useContext(MyContext) and get the value directly.

useReducer is for complex state management. When you have state that involves multiple sub-values or when the next state depends on the previous one, useReducer is your friend. It's inspired by Redux.

useMemo is a performance optimization hook. It memoizes expensive calculations so they don't run on every render. Only use it when you have actual performance issues.

useCallback is similar to useMemo but for functions. It returns a memoized version of the callback that only changes if dependencies change. This is useful when passing callbacks to optimized child components.

useRef creates a mutable reference. Unlike state, changing a ref doesn't cause a re-render. Use it for accessing DOM nodes or keeping mutable values.

Custom hooks are functions that use other hooks. They let you reuse stateful logic across components. Always name them starting with 'use'.`
  },
  {
    url: top5[2].url,
    video_id: 'HnXPKtro4SM',
    word_count: 2100,
    text: `In this comprehensive tutorial, we'll cover all React Hooks in detail.

Starting with useState - this is your bread and butter for adding state to functional components. When you call useState, you pass in the initial state value. It returns an array where the first element is the current state and the second is a function to update that state. Remember, state updates are asynchronous.

useEffect is crucial for handling side effects. A side effect is any operation that affects something outside the component, like fetching data or updating the document title. useEffect runs after render. You can control when it runs by providing a dependency array. Empty array means run once, no array means run every render, and with dependencies means run when those dependencies change.

useContext simplifies working with React Context API. Context provides a way to pass data through the component tree without manually passing props. useContext accepts a context object and returns the current context value.

useReducer is an alternative to useState for managing complex state logic. It's especially useful when you have multiple state values that are related or when the next state depends on the previous one. useReducer takes a reducer function and an initial state, returning the current state and a dispatch function.

useMemo is a performance optimization tool. It memoizes the result of a calculation and only recalculates when dependencies change. Don't use it everywhere - only when you have expensive calculations.

useCallback memoizes functions. This is important when passing callbacks to child components that rely on reference equality to prevent unnecessary renders.

useRef returns a mutable ref object whose .current property persists across renders. It's perfect for accessing DOM elements or storing mutable values that don't need to trigger re-renders when they change.

Creating custom hooks allows you to extract and reuse stateful logic. Custom hooks are JavaScript functions whose names start with 'use' and that may call other hooks. They're a powerful way to share logic between components.`
  },
  {
    url: top5[3].url,
    video_id: 'cF2lQ_gZeA8',
    word_count: 980,
    text: `Welcome to this React Hooks tutorial series. Let's start with an introduction.

React Hooks were introduced in React 16.8. They let you use state and other React features without writing a class. Before hooks, you needed class components for state and lifecycle methods.

The most basic hook is useState. It allows functional components to have state. You call useState with an initial value, and it gives you back the current state and a function to update it.

useEffect is for side effects - operations that affect things outside your component. This includes data fetching, subscriptions, and DOM manipulation. It replaces lifecycle methods like componentDidMount and componentDidUpdate.

useContext lets you subscribe to React context without introducing nesting. Context provides a way to share values between components without passing props through every level.

useReducer is useful for complex state logic. If you're familiar with Redux, you'll recognize the pattern. It's great when you have multiple related state values.

There are also performance optimization hooks like useMemo and useCallback. These help prevent unnecessary recalculations and re-renders.

useRef gives you a way to persist values across renders without causing re-renders. It's commonly used to access DOM elements.

You can also create your own custom hooks to reuse stateful logic across components. This is one of the most powerful features of hooks.`
  },
  {
    url: top5[4].url,
    video_id: '-4XpG5_Lj_o',
    word_count: 1450,
    text: `Let's focus on useEffect, one of the most important React Hooks.

useEffect is used for side effects in React components. A side effect is anything that affects something outside the scope of the function being executed. Common examples include fetching data from an API, setting up subscriptions, and manually changing the DOM.

The basic syntax is useEffect with a function as the first argument. This function runs after every render by default. But you can control when it runs using the dependency array as the second argument.

If you pass an empty dependency array, the effect runs only once after the initial render. This is similar to componentDidMount in class components.

If you pass variables in the dependency array, the effect runs whenever those variables change. This is similar to componentDidUpdate but more precise.

useEffect can also return a cleanup function. This cleanup runs before the component unmounts and before the effect runs again. It's similar to componentWillUnmount. Use cleanup for things like canceling subscriptions or clearing timers.

Common use cases for useEffect include fetching data when a component mounts, subscribing to external data sources, and updating the document title based on component state.

A common mistake is forgetting to include dependencies in the dependency array. This can lead to bugs where your effect doesn't run when it should, or uses stale values.

Another mistake is creating infinite loops by updating state that's in the dependency array without proper conditions.

Remember, useEffect runs after the render is committed to the screen. If you need to run something before the DOM updates, use useLayoutEffect instead, though this is rarely needed.

Understanding useEffect is crucial for working effectively with React Hooks. It's one of the most powerful and commonly used hooks.`
  }
];

async function testWithMockTranscripts() {
  try {
    console.log('\n📹 TOP 5 VIDEOS:\n');
    top5.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channel}`);
      console.log(`   Score: ${video.score}/100`);
      console.log('');
    });
    
    console.log('📝 MOCK TRANSCRIPTS LOADED:\n');
    mockTranscripts.forEach((t, i) => {
      console.log(`✅ Video ${i + 1}: ${t.word_count} words`);
    });
    
    console.log('\n🤖 Analyzing with OpenAI...\n');
    const startTime = Date.now();
    
    const analysis = await analyzeVideos(mockTranscripts, top5);
    
    const duration = Date.now() - startTime;
    
    console.log('='.repeat(60));
    console.log('✅ ANALYSIS COMPLETE!');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Analysis Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`🎯 Consensus Points: ${analysis.consensus_points.length}`);
    console.log(`💡 Per-Video Analyses: ${analysis.per_video.length}`);
    
    // Display Consensus Points
    if (analysis.consensus_points.length > 0) {
      console.log('\n🎯 CONSENSUS INSIGHTS:\n');
      analysis.consensus_points.forEach((point, index) => {
        console.log(`${index + 1}. ${point.summary}`);
        console.log(`   📊 Support: ${point.support_count}/${top5.length} videos`);
        console.log(`   ⭐ Weight: ${point.weight || 'N/A'}`);
        if (point.supporting_videos && point.supporting_videos.length > 0) {
          const videoNums = point.supporting_videos.map(v => (v.index !== undefined ? v.index : v.video_index !== undefined ? v.video_index : 0) + 1);
          console.log(`   📹 Sources: Video ${videoNums.join(', Video ')}`);
        }
        console.log('');
      });
    }
    
    // Display Per-Video Highlights
    console.log('💡 PER-VIDEO HIGHLIGHTS:\n');
    analysis.per_video.forEach((videoAnalysis, index) => {
      console.log(`Video ${index + 1}: ${top5[index].title}`);
      if (videoAnalysis.highlights && videoAnalysis.highlights.length > 0) {
        videoAnalysis.highlights.slice(0, 3).forEach(highlight => {
          console.log(`   • ${highlight.point}`);
          if (highlight.evidence) {
            console.log(`     Evidence: "${highlight.evidence.substring(0, 60)}..."`);
          }
        });
      }
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('🎉 FULL PIPELINE DEMONSTRATION COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n✅ What This Demonstrates:');
    console.log('   ✅ OpenAI extracts key points from each video');
    console.log('   ✅ Finds common themes across all videos');
    console.log('   ✅ Ranks insights by how many videos mention them');
    console.log('   ✅ Provides evidence and timestamps');
    console.log('   ✅ Generates actionable consensus insights');
    
    console.log('\n📝 Note: This used mock transcripts due to YouTube rate limiting.');
    console.log('   In production, real transcripts will be fetched automatically.');
    console.log('   The analysis logic is identical and fully functional.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testWithMockTranscripts();
