from fastapi import APIRouter, Query
from schemas import TopicResponse

router = APIRouter(prefix="/topics", tags=["topics"])

AI_TOPICS = [
    "Neural Networks",
    "Machine Learning Fundamentals",
    "Deep Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Reinforcement Learning",
    "Generative AI & Large Language Models",
    "Decision Trees & Random Forests",
    "Support Vector Machines",
    "Clustering & Unsupervised Learning",
    "Recommendation Systems",
    "AI Ethics & Bias",
    "Transfer Learning",
    "Convolutional Neural Networks",
    "Recurrent Neural Networks & LSTMs",
]

QC_TOPICS = [
    "Quantum Computing Basics",
    "Qubits & Superposition",
    "Quantum Entanglement",
    "Quantum Gates & Circuits",
    "Quantum Algorithms (Shor's, Grover's)",
    "Quantum Error Correction",
    "Variational Quantum Eigensolvers",
    "Quantum Machine Learning",
    "Quantum Cryptography",
    "Quantum Hardware & Technologies",
    "Quantum Supremacy & Advantage",
    "Bloch Sphere & State Representation",
    "Quantum Teleportation",
    "Quantum Annealing",
    "Post-Quantum Cryptography",
]


@router.get("", response_model=TopicResponse)
def get_topics(domain: str = Query(..., description="AI or QC")):
    if domain.upper() in ("AI", "ARTIFICIAL INTELLIGENCE"):
        return TopicResponse(domain="AI", topics=AI_TOPICS)
    elif domain.upper() in ("QC", "QUANTUM COMPUTING"):
        return TopicResponse(domain="QC", topics=QC_TOPICS)
    else:
        return TopicResponse(domain=domain, topics=AI_TOPICS)
