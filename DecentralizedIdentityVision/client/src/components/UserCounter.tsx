import { motion } from 'framer-motion';

interface UserCounterProps {
  count: number;
}

const UserCounter = ({ count }: UserCounterProps) => {
  // Format the count with commas for thousands
  const formattedCount = count.toLocaleString();
  
  return (
    <div className="mt-10 flex items-center">
      <div className="flex -space-x-3">
        {/* User avatar circles - just show 3 as design shows */}
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-2 border-primary-900"
          initial={{ scale: 0, x: -20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </motion.div>
        
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center border-2 border-primary-900"
          initial={{ scale: 0, x: -15 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </motion.div>
        
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center border-2 border-primary-900"
          initial={{ scale: 0, x: -10 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </motion.div>
      </div>
      
      <motion.span 
        className="ml-4 text-gray-300"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Join <span className="font-semibold text-white">{formattedCount}+</span> users already securing their identity
      </motion.span>
    </div>
  );
};

export default UserCounter;
