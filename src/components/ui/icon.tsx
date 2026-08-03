import {
  Monitor, ShieldCheck, BrainCircuit, PenTool, Megaphone, HeartPulse, Car, Zap,
  HardHat, Factory, Utensils, Sparkles, Leaf, Truck, Footprints, GraduationCap,
  Hammer, FileText, Rocket, Target, BadgeCheck, Radar, ArrowRight, ArrowLeft,
  Check, X, Plus, Minus, Search, MapPin, Star, Clock, Globe, IndianRupee, BookOpen,
  Award, ChevronRight, ChevronDown, Menu, Bell, User, Settings, LogOut, Home,
  Compass, Route, LayoutDashboard, Briefcase, Building2, FlaskConical, Cpu,
  MessageCircle, Lightbulb, TrendingUp, Wallet, Users, Mail, Lock, Eye, EyeOff,
  Phone, Link2, CircleDollarSign, Layers, GitBranch, Calendar, PlayCircle,
  CircleCheckBig, Circle, Sparkle, Wand2, Brain, Rocket as RocketIcon, SlidersHorizontal,
  MapPinOff, RefreshCcw, Send, Bot, History, Trophy, Gift, Info, AlertTriangle,
  CircleAlert, ThumbsUp, ThumbsDown, ExternalLink, ArrowUpRight, Download, Share2,
  QrCode, BadgeIndianRupee, BarChart3, LineChart, PieChart, Shield, Terminal,
  Laptop, Palette, Music, Salad, Dumbbell, Code, Cloud, Database, Gauge, Fingerprint,
  KeyRound, Layers2, Heart,  CheckCircle2, ChevronLeft, SearchX, Filter,
  ClipboardCheck, Bookmark, FileDown, Wrench, Crown, PartyPopper, Flag, Loader,
  LoaderCircle, Mic, Paperclip, Play, Fuel, Battery, BrainCog, CalendarDays,
  CheckCheck, Timer, Quote, Users2, BadgePercent, ArrowUpDown, Package, Milestone,
  Wand, CirclePlus, StarHalf, Sun, Moon, Languages, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor, ShieldCheck, BrainCircuit, PenTool, Megaphone, HeartPulse, Car, Zap,
  HardHat, Factory, Utensils, Sparkles, Leaf, Truck, Footprints, GraduationCap,
  Hammer, FileText, Rocket, Target, BadgeCheck, Radar, ArrowRight, ArrowLeft,
  Check, X, Plus, Minus, Search, MapPin, Star, Clock, Globe, IndianRupee, BookOpen,
  Award, ChevronRight, ChevronDown, Menu, Bell, User, Settings, LogOut, Home,
  Compass, Route, LayoutDashboard, Briefcase, Building2, FlaskConical, Cpu,
  MessageCircle, Lightbulb, TrendingUp, Wallet, Users, Mail, Lock, Eye, EyeOff,
  Phone, Link2, CircleDollarSign, Layers, GitBranch, Calendar, PlayCircle,
  CircleCheckBig, Circle, Sparkle, Wand2, Brain, RocketIcon, SlidersHorizontal,
  MapPinOff, RefreshCcw, Send, Bot, History, Trophy, Gift, Info, AlertTriangle,
  CircleAlert, ThumbsUp, ThumbsDown, ExternalLink, ArrowUpRight, Download, Share2,
  QrCode, BadgeIndianRupee, BarChart3, LineChart, PieChart, Shield, Terminal,
  Laptop, Palette, Music, Salad, Dumbbell, Code, Cloud, Database, Gauge, Fingerprint,
  KeyRound, Layers2, Heart,  CheckCircle2, ChevronLeft, SearchX, Filter,
  ClipboardCheck, Bookmark, FileDown, Wrench, Crown, PartyPopper, Flag, Loader,
  LoaderCircle, Mic, Paperclip, Play, Fuel, Battery, BrainCog, CalendarDays,
  CheckCheck, Timer, Quote, Users2, BadgePercent, ArrowUpDown, Package, Milestone,
  Wand, CirclePlus, StarHalf, Sun, Moon, Languages,
};

export function Icon({ name, className, size = 20 }: { name: string; className?: string; size?: number }) {
  const Cmp = ICON_MAP[name] ?? Sparkle;
  return <Cmp className={className} size={size} aria-hidden="true" />;
}

export { ICON_MAP };
