document.addEventListener('DOMContentLoaded', function() {
    // Create Lean Manufacturing Tree Diagram
    createLeanTree();
    
    // Create Fishbone Diagram for TQM
    createFishboneDiagram();
    
    // Form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

function createLeanTree() {
    const data = {
        name: "Lean Manufacturing",
        children: [
            {
                name: "Principles",
                children: [
                    { name: "Value" },
                    { name: "Value Stream" },
                    { name: "Flow" },
                    { name: "Pull" },
                    { name: "Perfection" }
                ]
            },
            {
                name: "Tools",
                children: [
                    { name: "5S" },
                    { name: "Kanban" },
                    { name: "Kaizen" },
                    { name: "Poka-Yoke" },
                    { name: "VSM" }
                ]
            },
            {
                name: "Benefits",
                children: [
                    { name: "Reduced Waste" },
                    { name: "Improved Quality" },
                    { name: "Lower Costs" },
                    { name: "Shorter Lead Times" }
                ]
            }
        ]
    };

    // Adjusted dimensions for better layout
    const width = 800;  // Increased width for better spacing
    const height = 500; // Increased height to prevent clipping

    // Clear previous SVG and create a new one
    d3.select("#lean-tree svg").remove();
    const svg = d3.select("#lean-tree")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(40,40)"); // Adjusted starting position

    // Hierarchy + Tree Layout with more spacing
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([width - 100, height - 150]); // More spacing

    // Assign positions to nodes
    treeLayout(root);

    // Draw links (branches) with improved styling
    svg.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
        .style("fill", "none")
        .style("stroke", "#3498db")
        .style("stroke-width", "1.5px")
        .style("opacity", 0.7);

    // Draw nodes with better spacing
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add circles to nodes with better visibility
    node.append("circle")
        .attr("r", 6)
        .style("fill", "#e74c3c")
        .style("stroke", "#fff")
        .style("stroke-width", "1.5px");

    // Add labels with improved positioning
    node.append("text")
        .attr("dy", d => d.children ? "-1em" : "1.5em") // Position above for parents, below for children
        .attr("x", d => d.children ? 0 : 8) // Offset for leaf nodes
        .style("text-anchor", d => d.children ? "middle" : "start")
        .text(d => d.data.name)
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
        .style("fill", "#2c3e50")
        .style("font-weight", d => d.children ? "bold" : "normal");
}

function createFishboneDiagram() {
    const width = 300;
    const height = 300;
    
    const svg = d3.select("#tqm-fishbone")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Main arrow (spine)
    svg.append("line")
        .attr("x1", width * 0.1)
        .attr("y1", height / 2)
        .attr("x2", width * 0.9)
        .attr("y2", height / 2)
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");
    
    // Arrowhead definition
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#3498db");
    
    // Categories
    const categories = [
        { name: "Methods", angle: 30 },
        { name: "Materials", angle: 50 },
        { name: "Machines", angle: 85 },
        { name: "Manpower", angle: -30 },
        { name: "Environment", angle: -50 },
        { name: "Management", angle: -85 }
    ];
    
    const centerX = width * 0.5;
    const centerY = height / 2;
    const boneLength = 50;
    
    categories.forEach(cat => {
        const angleRad = cat.angle * Math.PI / 180;
        const endX = centerX - boneLength * Math.cos(angleRad);
        const endY = centerY - boneLength * Math.sin(angleRad);
        
        // Bone line
        svg.append("line")
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", endX)
            .attr("y2", endY)
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 1.5);
        
        // Category text
        svg.append("text")
            .attr("x", endX - 5 * Math.cos(angleRad))
            .attr("y", endY - 5 * Math.sin(angleRad))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(cat.name)
            .style("font-size", "10px")
            .style("fill", "#2c3e50");
    });
    
    // Problem statement
    svg.append("text")
        .attr("x", width * 0.1)
        .attr("y", height / 2 - 15)
        .text("Quality Issue")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50");
}