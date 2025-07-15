
interface ScoreBannerProps {
    score: number;
    total: number;
}
  
export default function ScoreBanner({ score, total }: ScoreBannerProps) {
    if (total === 0) return (
        <div className="flex flex-col items-end text-right">
            <span className="font-bold text-lg text-primary">0 / 0</span>
            <span className="text-sm text-muted-foreground">(0%)</span>
        </div>
    );
    const percentage = Math.round((score / total) * 100);

    return (
        <div className="flex flex-col items-end text-right">
            <span className="font-bold text-lg text-primary">{score} / {total}</span>
            <span className="text-sm text-muted-foreground">({percentage}%)</span>
        </div>
    );
}
