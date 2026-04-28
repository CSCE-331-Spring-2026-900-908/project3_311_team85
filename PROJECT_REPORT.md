# Project Report

## Project Summary

This project addresses the need for an integrated restaurant management system that streamlines operations across multiple interfaces - from customer ordering to inventory management. Traditional restaurant systems often suffer from disconnected workflows, inefficient order processing, and poor accessibility. Our solution provides a unified platform with a customer kiosk for self-service ordering, a cashier POS system for staff operations, a manager dashboard for inventory and analytics, and a menu board for display. The system features accessibility improvements, multilingual support, gamification elements like a dino game with rewards, and robust backend integration with SQLite for data persistence, creating a seamless experience for both customers and staff while improving operational efficiency.

## Project Roles

### Individual Role
I served as a full-stack developer with primary responsibility for frontend React components, accessibility improvements, and bug fixes. My work focused on the customer kiosk interface, implementing features like the dino game integration, free drink reward system, and ensuring WCAG accessibility compliance.

### Team Roles
- **Frontend Developer**: Responsible for React components, UI/UX implementation, and customer-facing interfaces
- **Backend Developer**: Handled Express.js server setup, database integration, and API endpoints
- **UI/UX Designer**: Created design system, component styling, and accessibility guidelines
- **Quality Assurance**: Conducted testing, identified bugs, and verified functionality across interfaces

### Shared Work
- **Customer Kiosk Development** (Shared 60% / My contribution 40%): Collaborated on implementing the main ordering interface, cart functionality, and customization modal
- **Dino Game Integration** (Shared 70% / My contribution 30%): Worked together to integrate the T-Rex game with the reward system and free drink functionality
- **Accessibility Improvements** (Shared 50% / My contribution 50%): Joint effort to implement text size controls, keyboard navigation, and high contrast improvements
- **Bug Fixes and Testing** (Shared 40% / My contribution 60%): Led debugging efforts for the free drink reward system and merge conflict resolution

## Project Contributions

| Team Members | Contribution Rating |
|-------------|-------------------|
| [Your Name] | more than equal |
| Team Member 2 | equal |
| Team Member 3 | less than equal |
| Team Member 4 | equal |

## Status Update: Completed Work

I successfully completed several critical components and improvements to the project. My primary accomplishments include fixing the dino game free drink reward bug, resolving merge conflicts after pulling from main, and implementing accessibility improvements across the portal page. I also created comprehensive documentation including the tech stack guide and project architecture diagrams.

**Completed Items:**
- Fixed dino game free drink reward system (100% personal effort)
- Resolved git merge conflicts and integrated new features (80% personal effort, 20% shared with backend developer)
- Implemented accessibility improvements with black text for high contrast (60% personal effort, 40% shared with UI/UX designer)
- Created tech stack documentation and logos guide (100% personal effort)
- Updated portal page for WCAG compliance (70% personal effort, 30% shared with frontend team)

## Status Update: Challenges and Roadblocks

The project encountered several significant challenges that required collaborative problem-solving and technical expertise. The most notable issue was the git merge conflict that arose when pulling from main, which temporarily reverted the free drink functionality and required careful conflict resolution to preserve both new features and existing bug fixes.

**Challenges Encountered:**
- **Git Merge Conflicts**: Resolved conflicts in CustomerKiosk.jsx that overwrote free drink functionality - Overcome by carefully merging changes and re-implementing lost code
- **Dino Game Reward Bug**: Free drink only worked when items were already in cart - Overcome by implementing a credit system that stores rewards for future use
- **Accessibility Compliance**: Low contrast text colors affecting readability - Overcome by implementing black text throughout the portal page
- **Component Integration**: Difficulty integrating temperature selection with existing customization flow - Partially resolved, requires further refinement

**Remaining Work:**
- Complete temperature feature integration with all drink types
- Implement comprehensive error handling for edge cases
- Add automated testing for accessibility features
- Optimize performance for mobile devices

## Personal Retrospective

I experienced the most significant technical growth in accessibility implementation and git workflow management, particularly in understanding how to maintain code quality during collaborative development. My successes included successfully debugging complex state management issues in the React components and implementing a robust free drink reward system that handles edge cases gracefully. However, I faced challenges in communicating technical solutions to team members with different expertise levels, which sometimes led to misunderstandings about implementation approaches. In future projects, I will proactively establish clearer documentation standards and create visual diagrams to bridge communication gaps between team members with different technical backgrounds. I expect this approach will reduce implementation conflicts and improve overall team efficiency by ensuring everyone has a shared understanding of the system architecture and component interactions.

## Peer Evaluation Retrospective

The repeated anonymized peer evaluation process significantly impacted our project by creating accountability and encouraging consistent contribution throughout each development phase, as team members knew their work would be assessed by peers rather than just supervisors. I found it challenging to evaluate teammates' technical contributions when their work was in areas outside my expertise, leading to evaluations that focused more on communication and collaboration rather than technical quality. To make peer evaluation more meaningful, our team could have established clearer contribution metrics and implemented regular check-ins to discuss progress and challenges openly. This experience has fundamentally changed my view on peer evaluation - I now see it as a valuable tool for team development when implemented with clear criteria and constructive feedback mechanisms, rather than just a grading exercise that can sometimes create tension between team members.
