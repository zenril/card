// Time ago formatting utility
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
        return seconds === 1 ? '1 sec' : `${seconds} secs`;
    }
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return minutes === 1 ? '1 min' : `${minutes} mins`;
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days < 30) {
        return days === 1 ? '1 day' : `${days} days`;
    }
    
    // Convert to months
    const months = Math.floor(days / 30);
    if (months < 12) {
        return months === 1 ? '1 month' : `${months} months`;
    }
    
    // Convert to years
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year' : `${years} years`;
}

